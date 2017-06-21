import { server } from '../server';

const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;

describe('API endpoints', () => {

    it('should be online', (done) => {
        supertest(server)
            .get('/health')
            .end((err, response) => {
                if (err) {
                    done(err);
                }
                else {
                    expect(response.status).to.equal(200);
                    expect(response.type).to.equal('application/json');
                    expect(response.body['health']).to.equal('ok');
                    done();
                }
            });
    });

    it('handle routing errors', (done) => {
        supertest(server)
            .get('/isHealthy')
            .end((err, response) => {
                if (err) {
                    done(err);
                }
                else {
                    expect(response.status).equals(404);

                    const errorType = 'ResourceNotFound';
                    expect( response.body['code'] ).equals( errorType );
                    done();
                }
            });
    });

    it('returns Html page as root context', (done) => {
        supertest(server)
            .get( `/` )
            .end((err, response) => {
                if (err) {
                    done(err);
                }
                else {
                    expect(response.status).to.equal(200);
                    done();
                }
            });
    });

    it('upload CSV files', (done) => {
        supertest(server)
            .post('/upload')
            .attach('file', './test/contacts.csv') // test CSV file

            .end((err, response) => {
                if (err) {
                    done(err);
                }
                else {
                    expect(response.status).to.equal(202);
                    expect(response.type).to.equal('text/html');
                    done();
                }
            });
    });

    it('get parsed data from DB', (done) => {
        supertest(server)
            .get('/contacts')
            .end((err, response) => {
                if (err) {
                    done(err);
                }
                else {
                    expect(response.status).to.equal(200);
                    expect(response.type).to.equal('text/html');
                    expect(parseInt(response.header['retrieved-rows-number']))
                        .to.equal( 4 ); // lines in /test/contacts.csv
                    done();
                }
            });
    });

});