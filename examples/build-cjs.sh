#!/usr/bin/env bash
cd ..
command -v browserify >/dev/null 2>&1 || { echo >&2 "browserify not installed. run 'npm install -g browserify'. Aborting."; exit 1; }
bower install
npm install deamdify
npm install scribe-plugin-toolbar
browserify -g deamdify \
-r ./bower_components/immutable/dist/immutable.js:immutable \
-r ./bower_components/lodash-amd/modern/object/assign.js:lodash-amd/modern/object/assign \
-r ./bower_components/lodash-amd/modern/object/defaults.js:lodash-amd/modern/object/defaults \
-r ./bower_components/lodash-amd/modern/string/escape.js:lodash-amd/modern/string/escape \
examples/cjs.js > examples/build.js