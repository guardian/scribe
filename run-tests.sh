#!/bin/bash

export BROWSER_NAME=${BROWSER_NAME:=chrome}

export TEST_SERVER_PORT=${TEST_SERVER_PORT:=8880}

./node_modules/.bin/http-server -p $TEST_SERVER_PORT --silent &
PID=$!
node test/runner
TEST_RUNNER_EXIT=$?
kill $PID

if [ $TEST_RUNNER_EXIT == "0" ]; then
    exit 0
else
    exit 1
fi

