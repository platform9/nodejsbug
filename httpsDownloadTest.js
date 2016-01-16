
'use strict';
var https = require('https');
var streamBuffers;
try {
    streamBuffers = require('stream-buffers');
} catch (err) {
    streamBuffers = require('../client/node_modules/stream-buffers');
}
//var srcUrl = 'https://nodejs.org/dist/v4.2.4/node-v4.2.4.tar.gz';
//var srcUrl = 'https://10.4.254.140/clarity/pf9-ostackhost-1.4.0-1920.x86_64.rpm';
//var srcUrl = 'https://10.4.254.140/';
var srcUrl = 'https://nodejsbug.platform9.horse/';
var fs = require('fs');

var urlParser = require('url');
var fields = urlParser.parse(srcUrl);
var opts = {
    hostname: fields.hostname,
    // servername: 'squid',
    /*
    ca: fs.readFileSync('/etc/pf9/certs/ca/cert.pem'),
    key: fs.readFileSync('/etc/pf9/certs/hostagent/key.pem'),
    cert: fs.readFileSync('/etc/pf9/certs/hostagent/cert.pem'),
    */
    path: fields.path
};
opts.rejectUnauthorized = false;
var remaining = 20;
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
        var stream = new streamBuffers.WritableStreamBuffer({
            initialSize: 4*1024*1024,    // 4 MB
            incrementAmount: 4*1024*1024 // 4 MB
        });
        stream.on('error', onStreamError);
        stream.once('finish', onStreamFinish);
        resp.pipe(stream);
        //resp.on('end', onStreamFinish);

        function onStreamError(err) {
            console.error('stream error:', err);
        }
        function onStreamFinish() {
            if (stream.size() != len) {
                var msg = 'file size mismatch ' + stream.size() + ' != ' + len;
                fail(msg);
            } else {
                console.log('Download OK');
            }
            next();
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
