/*
 * Warning: shameless self-plug!
 * Plumber is the Guardian’s tool of choice for build systems.
 * https://github.com/plumberjs/plumber
 */

var all       = require('plumber-all');
var glob      = require('plumber-glob');
var requireJS = require('plumber-requirejs');
var uglifyJS  = require('plumber-uglifyjs');
var write     = require('plumber-write');

module.exports = function (pipelines) {
  var toBuildDir = write('./build');
  var writeBoth = all(
    // Send the resource along these branches
    [uglifyJS(), toBuildDir],
    toBuildDir
  );

  pipelines['build'] = [
    glob('src/scribe-plugin-toolbar.js'),
    requireJS(),
    writeBoth
  ];
};
