import * as restify from 'restify';
import * as bunyan from 'bunyan';
import { createLiner as getLinerInstance } from './src/liner';
import { 
    db,
    stmtInsertContact
} from './src/db';


const logServer = bunyan.createLogger({
    name: 'serverLog',
    streams: [
        {
            level: 'debug',
            stream: process.stdout
        },
        {
            level: 'debug',
            path: './logs/server.log',
            type: 'rotating-file',
            period: '1d',   // daily rotation
            count: 10       // keep this number of back copies
        }
    ]
});
//logServer.info("process.env.NODE_ENV = %s", process.env.NODE_ENV);

export const server = restify.createServer({
    name: 'CSV Processing Demo',
    log: logServer,
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser({
    multipartFileHandler: function (part, req) {
        const liner = getLinerInstance();
        part.pipe(liner);

        let numLines = 0;
        liner.on('readable', function () {
            let line;
            while (null !== (line = liner.read())) {
                numLines++;
                //console.log( line );

                // line processing
                let values = line.split(',');
                stmtInsertContact.run(values[0], values[1], values[2]);
            }
        });

        part.on('end', () => {
            logServer.debug(`Uploaded lines, totally: ${numLines}`);
        });
    }
}));

/**
 * Request handling before routing.
 * Note that req.params will be undefined, as that's filled in after routing.
 */
server.pre(function (req, res, next) {
    const log = req.log;
    log.info(`${req.method.toUpperCase()} ${req.url}`);
    //log.debug({ headers: req.headers }, 'req.Headers:');
    next();
});

/**
 * Utility endpoint.
 */
server.get('/health', function (req, res, next) {
    res.json(200, { 'health': 'ok' });
    return next();
});

/**
 * Mapping static resources
 */
server.get('/', restify.serveStatic({
    directory: './public',
    file: 'index.html'
}));
server.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
}));

/**
 * File processing
 */
server.post('/upload', function (req, res, next) {
    const log = req.log;
    /*
    log.debug({ headers: req.headers }, 'req.Headers:');
    log.debug({ params: req.params }, 'req.Params:');
    log.debug({ files: req.files }, 'req.Files:');
    //log.debug({ request: req }, 'Request:');
    */

    //log.debug(`isUpload ? ${req.isUpload()}`);
    //log.debug(`req.files: ${req.files}`);

    log.info('Upload completed');

    const body = '<!DOCTYPE html><body><p>Upload completed.</p><br/>See saved contacts: <a href="/contacts">/contacts</a></body>';
    res.writeHead(202, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
    });
    res.write(body);    
    res.end();
});

/**
 * List of saved contacts.
 */
server.get('/contacts', function (req, res, next) {
    let output = '';
    db.serialize(function () {
        db.each("SELECT rowid AS id, firstname, lastname, email FROM contacts", 
            //  each row callback
            function (err, row) {
                //console.log(`${row.id}: ${row.firstname} ${row.lastname} - ${row.email}`);
                output += `${row.id}: ${row.firstname} ${row.lastname} - ${row.email}`;
            },
            //  complete callback
            function (err, rowsNum) {
                const body = `<!DOCTYPE html><p>retrieved rows: ${rowsNum}</p><pre>${output}</pre>`;
                res.writeHead(200, {
                    'retrieved-rows-number': rowsNum,
                    'Content-Length': Buffer.byteLength(body),
                    'Content-Type': 'text/html'
                });
                res.write(body);    
                res.end();
                
            }
        );
    });
});

/**
 * Starting server
 */
const cfgPort = 8000; //config.get('port') || 8000;
server.listen(cfgPort, function () {
    logServer.info('%s listening at %s', server.name, server.url);
});
