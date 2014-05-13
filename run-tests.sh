#!/bin/bash

./node_modules/.bin/http-server --silent &
node test/runner
