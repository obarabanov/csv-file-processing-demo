import * as stream from 'stream';

export function createLiner() {

    return new stream.Transform({

        objectMode: true,

        transform: function (chunk, encoding, done) {

            let data = chunk.toString();

            if (this._lastLineData) {
                data = this._lastLineData + data;
            }

            const lines = data.split('\n');
            this._lastLineData = lines.splice(lines.length - 1, 1)[0];

            lines.forEach(this.push.bind(this));
            done();
        },

        flush: function (done) {
            if (this._lastLineData) {
                this.push(this._lastLineData);
            }
            this._lastLineData = null;
            done();
        }

    });

}