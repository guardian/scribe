/**
 * IMPORTANT: FIXME: These tests are referring to the source of plugins at their
 * master branch, so if you’re checking this out from the future, it’s probably
 * not going to run the tests.
 */

/**
 * TODO:
 * - Conditional skip inside of tests: https://github.com/visionmedia/mocha/issues/591
 */

var Mocha = require('mocha');
var createRunner = require('scribe-test-harness/create-runner');

var mocha = new Mocha();

/**
 * Wait for the connection to Sauce Labs to finish.
 */
mocha.timeout(15 * 1000);
mocha.reporter('spec');

// Unit tests
mocha.addFile(__dirname + '/unit/event-emitter.spec.js');
mocha.addFile(__dirname + '/unit/config.spec.js');

// Browser tests
mocha.addFile(__dirname + '/block-mode.spec.js');
mocha.addFile(__dirname + '/commands.spec.js');
mocha.addFile(__dirname + '/formatters.spec.js');
mocha.addFile(__dirname + '/inline-elements-mode.spec.js');
mocha.addFile(__dirname + '/patches.spec.js');
mocha.addFile(__dirname + '/undo-manager.spec.js');
mocha.addFile(__dirname + '/selection.spec.js');


createRunner(mocha);
