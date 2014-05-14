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
 * FIXME: We have to set a ridiculous timeout (20 minutes) because Travis’
 * concurrent builds will sometimes exceed Sauce Labs’ concurrency. We should
 * track the following issue to add an option to Travis for limiting
 * concurrency: https://github.com/travis-ci/travis-ci/issues/1366
 */
mocha.timeout(1200000);
mocha.reporter('spec');
mocha.addFile(__dirname + '/block-mode.spec.js');
mocha.addFile(__dirname + '/commands.spec.js');
mocha.addFile(__dirname + '/formatters.spec.js');
mocha.addFile(__dirname + '/inline-elements-mode.spec.js');
mocha.addFile(__dirname + '/patches.spec.js');
mocha.addFile(__dirname + '/undo-manager.spec.js');

createRunner(mocha);
