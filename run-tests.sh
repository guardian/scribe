#!/bin/bash

./node_modules/.bin/http-server -p $TEST_SERVER_PORT --silent &
PID=$!
node test/runner
kill $PID
