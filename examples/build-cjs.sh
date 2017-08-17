#!/usr/bin/env bash
cd ..
npm install
npm install scribe-plugin-toolbar
-r ./node_modules/immutable/dist/immutable.js:immutable \
-r ./node_modules/lodash-amd/modern/object/assign.js:lodash-amd/modern/object/assign \
-r ./node_modules/lodash-amd/modern/object/defaults.js:lodash-amd/modern/object/defaults \
-r ./node_modules/lodash-amd/modern/string/escape.js:lodash-amd/modern/string/escape \
examples/cjs.js > examples/build.js
