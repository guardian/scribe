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
var umdify = require('plumber-umdify')();

module.exports = function (pipelines) {
  var mainRequireJS = requireJS({
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'event-emitter': '../bower_components/eventEmitter/EventEmitter',
          'lodash-modern': '../bower_components/lodash-amd/modern'
      },
      shim: {
          'event-emitter': {
              exports: 'EventEmitter'
          }
      }
  });

  var sanitizerPluginRequireJS = requireJS({
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'html-janitor': '../../bower_components/html-janitor/src/html-janitor'
      }
  });

  var genericPluginRequireJS = requireJS({
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'lodash-modern': '../../bower_components/lodash-amd/modern'
      }
  });

  var toBuildDir = write('./build');
  var writeBoth = all(
    [umdify, toBuildDir],
    [uglifyJS, toBuildDir],
    toBuildDir
  );

  pipelines['build'] = [
    // TODO: use bower operation to find main of this component?
    // As per: https://github.com/bower/bower/issues/1090
    // bower('scribe'),
    glob('./src/scribe.js'),
    mainRequireJS,
    // Send the resource along these branches
    writeBoth
  ];

  /**
   * We define pipelines for building the non-core plugins. In the future the
   * source files for these plugins will live in another repository.
   */

  const genericPlugins = [
    'scribe-plugin-blockquote-command',
    'scribe-plugin-curly-quotes',
    'scribe-plugin-heading-command',
    'scribe-plugin-intelligent-unlink-command',
    'scribe-plugin-keyboard-shortcuts',
    'scribe-plugin-link-prompt-command',
    'scribe-plugin-smart-lists',
    'scribe-plugin-toolbar'
  ];

  genericPlugins.forEach(function (pluginName) {
    addPluginBuildPipeline(genericPluginRequireJS)(pluginName);
  });
  addPluginBuildPipeline(genericPluginRequireJS)('scribe-plugin-formatter-plain-text-convert-new-lines-to-html', '/formatters/plain-text');

  addPluginBuildPipeline(sanitizerPluginRequireJS)('scribe-plugin-sanitizer');

  function addPluginBuildPipeline(requireJSOperation) {
    return function (name, path) {
      pipelines['build:' + name] = [
        glob('./src/plugins' + (path || '') + '/' + name + '.js'),
        requireJSOperation,
        // Send the resource along these branches
        writeBoth
      ];
    };
  }
};
