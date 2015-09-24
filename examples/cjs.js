
/**
 * This example demonstrates how to consume the Scribe
 * editor using `browserify` and CommonJS module syntax.
 *
 * Note that you'll need to install scribe's dependencies
 * through `npm install`. `npm` is installed with Node.js.
 * See http://nodejs.org/ if you are unfamiliar.
 *
 * In order to compile the `build.js` file, run the following file: build-cjs.sh.
 *
 * See the `examples/cjs.html` file to see where this entry point
 * ends up being consumed.
 */

var Scribe = require('../');
var scribePluginToolbar = require('scribe-plugin-toolbar');

var scribe = new Scribe(document.getElementById('editor'));

scribe.setContent('<p>Hello, World!</p>');

scribe.use(scribePluginToolbar(document.querySelector('.toolbar')));


function updateHtml() {
  document.querySelector('.editor-output').value = scribe.getHTML();
}

scribe.on('content-changed', updateHtml);
updateHtml();
