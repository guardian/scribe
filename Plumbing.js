var all       = require('plumber-all');
// var bower  = require('plumber-bower');
var glob      = require('plumber-glob');
var requireJS = require('plumber-requirejs');
var uglifyjs  = require('plumber-uglifyjs')();
var write     = require('plumber-write');

module.exports = function (pipelines) {
  var requireJSConfig = {
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
  };

  var sanitizerPluginRequireJSConfig = {
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'html-janitor': '../../bower_components/html-janitor/src/html-janitor'
      }
  };

  var genericPluginRequireJSConfig = {
      // FIXME: auto?
      preserveLicenseComments: false,
      paths: {
          'lodash-modern': '../../bower_components/lodash-amd/modern'
      }
  };

  var toBuildDir = write('./build');
  pipelines['build'] = [
    // TODO: use bower operation to find main of this component?
    // As per: https://github.com/bower/bower/issues/1090
    // bower('scribe'),
    glob('./src/scribe.js'),
    requireJS(requireJSConfig),
    // Send the resource along these branches
    all(
      [uglifyjs, toBuildDir],
      toBuildDir
    )
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

  genericPlugins.forEach(addPluginBuildPipeline(genericPluginRequireJSConfig));

  addPluginBuildPipeline(sanitizerPluginRequireJSConfig)('scribe-plugin-sanitizer');

  function addPluginBuildPipeline(requireJSConfig) {
    return function (name) {
      pipelines['build:' + name] = [
        glob('./src/plugins/' + name + '.js'),
        requireJS(requireJSConfig),
        // Send the resource along these branches
        all(
          [uglifyjs, toBuildDir],
          toBuildDir
        )
      ];
    }
  }
};
