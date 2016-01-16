
'use strict';
var https = require('https');
var srcUrl = 'https://nodejsbug.platform9.horse/';
var fs = require('fs');
var TEMP_FILE_NAME = 'tempFile.dat';

var urlParser = require('url');
var fields = urlParser.parse(srcUrl);
var opts = {
    hostname: fields.hostname,
    path: fields.path
};
opts.rejectUnauthorized = false;
var remaining = 10;
download();

function download() {
    var req = https.request(opts, onResponse);
    req.on('error', onRequestError);
    req.end();

    function onResponse(resp) {
        var status = resp.statusCode;
        console.log('download: response status:', status);
        if (status != 200)
            fail('status is not 200');
        var len = resp.headers['content-length'];
        console.log('content length:', len);
        if (len === undefined)
            fail('no content length');
        var stream = fs.createWriteStream(TEMP_FILE_NAME);
        stream.on('error', onStreamError);
        stream.once('finish', onStreamFinish);
        resp.pipe(stream);
        //resp.on('end', onStreamFinish);

        function onStreamError(err) {
            console.error('stream error:', err);
        }
        function onStreamFinish() {
            var size = fs.statSync(TEMP_FILE_NAME).size;
            if (size != len) {
                var msg = 'file size mismatch ' + size + ' != ' + len;
                console.error(msg);
            } else {
                console.log('Download OK');
                next();
            }
        }
    }

    function onRequestError(err) {
        fail('request error: ' + err);
    }
}

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

function next() {
    if (--remaining == 0) {
        console.log('All downloads succeeded.');
    } else {
        download();
    }
}
