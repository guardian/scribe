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
var testEnvironment = require('scribe-test-harness/environment');

var mocha = new Mocha();

var specs = process.argv[2] || (__dirname + '/**/*.spec.js');

/**
 * Wait for the connection to Sauce Labs to finish.
 */
mocha.timeout(15 * 1000);
mocha.reporter('spec');

testEnvironment.loadSpecifications(specs, mocha)
  .then(function(mocha) {
    createRunner(mocha);
  });
