var chai = require('chai');
var expect = chai.expect;
var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

describe('events', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('focus', function () {
    when('content is empty string (regression test for #368)', function () {
      beforeEach(function () {
        return driver.executeScript(function() {
          window.errors = [];
          window.onerror = function(err) {
            errors.push(err);
          };

          // The initial focus and blur are necessary to ensure that
          // `selection.range` exists in Chrome.
          window.scribe.el.focus();
          window.scribe.el.blur();
          window.scribe.setContent('');
          window.scribe.el.focus();
        });
      });

      afterEach(function() {
        return driver.executeScript(function() {
          window.onerror = null;
        });
      });

      it('should not raise an error', function () {
        return driver.executeScript(function() {
          return window.errors;
        }).then(function(errors) {
          expect(errors).to.eql([]);
        });
      });
    });
  });
});
