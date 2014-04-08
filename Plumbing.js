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
var umdify = require('plumber-umdify');
var rename = require('plumber-rename');

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
      },
      onBuildWrite: umdify.onBuildWrite,
      wrap: umdify.wrap({'exportModule': 'scribe', 'globalKey': 'Scribe'})
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
    [uglifyJS, toBuildDir],
    toBuildDir
  );

 var buildPipelines = [[
    // TODO: use bower operation to find main of this component?
    // As per: https://github.com/bower/bower/issues/1090
    // bower('scribe'),
    glob('./src/scribe.js'),
    mainRequireJS,
    // Send the resource along these branches
    writeBoth
  ]];

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
      // Save the pipeline data for reference
      var pipeline = {
        path: path,
        name: name,
        glob: glob('./src/plugins' + (path || '') + '/' + name + '.js'),
        operation: requireJSOperation,
        writeBoth: writeBoth
      };

      // Add to separate build pipeline
      pipelines['build:' + name] = [
        pipeline.glob,
        pipeline.operation,
        // Send the resource along these branches
        pipeline.writeBoth
      ];

      // Add to main build pipeline
      var toBuildPluginDir = write('./build/plugins');
      var outputName = pipeline.name.replace(/^scribe-plugin-/,'');

      buildPipelines.push([
        pipeline.glob,
        pipeline.operation,
        umdify.map(),
        rename(outputName),
        toBuildPluginDir
      ]);
    };
  }

  // Generate the build pipeline
  pipelines['build'] = [all.apply(this,buildPipelines)];
};
