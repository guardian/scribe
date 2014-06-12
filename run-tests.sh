#!/bin/bash

./node_modules/.bin/http-server -p 8082 --silent &
node test/runner
