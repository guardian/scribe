#!/bin/bash

./node_modules/.bin/http-server -p $TEST_SERVER_PORT --silent &
node test/runner
