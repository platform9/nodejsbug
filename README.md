# nodejsbug
Client program for reproducing https stream truncation bug in node.js

## Background
We have a client/server program originally written in node.js 0.10.36. The server is a custom reverse proxy that uses TLS SNI feature to direct traffic based on the client's specified "servername" option in TLS. Recently, we started porting to node.js 4.2.4, beginning with the client, which required no code changes (the server will need changes due to differences in SNI support in the newer node.js TLS server module).

The client streams the HTTPS response to a file. We are noticing that once in a while, when downloading content, the destination file is truncated by several KB. This only happens when the client is run with node.js 4.2.4.

We've since tried to narrow this bug and write synthetic test programs. We were unable to reproduce it using a single program running on a single machine, so what we've done is set up a test server at https://nodejsbug.platform9.horse. A GET on this URL returns a payload of random bytes that is exactly 124416 bytes in length. This repo contains a test client that reproduces the bug by downloading content from the server.

## Instructions

1. Clone this repo onto a 64-bit Linux system. We used CentOS-7 but the code should work on others like Ubuntu.
1. Install curl and wget if not already installed
1. Cd to the repo root directory.
1. Download and expand node 0.10.41: `wget https://nodejs.org/download/release/v0.10.41/node-v0.10.41-linux-x64.tar.gz && tar xf node-v0.10.41-linux-x64.tar.gz` 
2. Download and expand node 4.2.4: `wget https://nodejs.org/dist/v4.2.4/node-v4.2.4-linux-x64.tar.xz && tar xf node-v4.2.4-linux-x64.tar.xz`
 
First, run `./httpsDownloadTest.sh` script. It executes curl 10 times and prints the size of the output file, confirming that the content length is 124416 bytes. You should see this output:

```
[centos@ip-172-31-23-87 ~]$ ./httpsDownloadTest.sh 
124416
124416
124416
124416
124416
124416
124416
124416
124416
124416
```

Next, run the test program httpsDownloadTest.js under node 0.10.41. It streams the content to memory using a WriteableStreamBuffer,  prints the final buffer length and verifies that it equals the Content-Length specified by the server:

```
[centos@ip-172-31-23-87 ~]$ node-v0.10.41-linux-x64/bin/node httpsDownloadTest.js 
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
download: response status: 200
content length: 124416
Download OK
All downloads succeeded.
```

Finally, to reproduce the problem, run the same program under node 4.2.4 and you should see the test fail, perhaps after several iterations:

```
[centos@ip-172-31-23-87 ~]$ node-v4.2.4-linux-x64/bin/node httpsDownloadTest.js 
download: response status: 200
content length: 124416
file size mismatch 65536 != 124416
```
