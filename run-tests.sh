#!/bin/bash

./node_modules/.bin/http-server -p 8080 --silent &
node test/runner
