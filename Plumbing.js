/*
 * Warning: shameless self-plug!
 * Plumber is the Guardian’s tool of choice for build systems.
 * https://github.com/plumberjs/plumber
 */

var all       = require('plumber-all');
// var bower  = require('plumber-bower');
var glob      = require('plumber-glob');
var requireJS = require('plumber-requirejs');
var uglifyJS  = require('plumber-uglifyjs')();
var write     = require('plumber-write');

module.exports = function (pipelines) {
  var mainRequireJS = requireJS({
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'lodash-amd': '../bower_components/lodash-amd',
          'immutable': '../bower_components/immutable'
      }
  });

  var toBuildDir = write('./build');
  var writeBoth = all(
    [uglifyJS, toBuildDir],
    toBuildDir
  );

  /* jshint -W069 */

  pipelines['build'] = [
    // TODO: use bower operation to find main of this component?
    // As per: https://github.com/bower/bower/issues/1090
    // bower('scribe'),
    glob('./src/scribe.js'),
    mainRequireJS,
    // Send the resource along these branches
    writeBoth
  ];
};
