#!/usr/bin/env bash
for i in $(seq 1 10) ; do rm -f /tmp/curl.out && curl -ks -o /tmp/curl.out https://nodejsbug.platform9.horse/ && ls -l  /tmp/curl.out |cut -d' ' -f5; done