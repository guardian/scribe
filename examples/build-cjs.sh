#!/usr/bin/env bash
cd ..
npm install
npm install scribe-plugin-toolbar
webpack \
./examples/cjs.js \
./node_modules/immutable/dist/immutable.js \
./node_modules/lodash-amd/modern/object/assign.js \
./node_modules/lodash-amd/modern/object/defaults.js \
./node_modules/lodash-amd/modern/string/escape.js \
./examples/build.js \
 --config ./webpack.conf.js
