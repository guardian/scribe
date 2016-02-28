'use strict';

var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var givenContentOf = helpers.givenContentOf;
var when = helpers.when;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe', {
  defaultFormatters: [],
  defaultPlugins: []
});

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function() {
  scribeNode = helpers.scribeNode;
});

describe('defaults overrides', function() {
  beforeEach(function() {
    return initializeScribe();
  });

  describe('plugin override', function() {
    when('scribe is loaded', function() {
      it('should contain zero default plugins', function () {
        return driver.executeScript(function () {
          return window.scribe.options.defaultPlugins.length;
        }).then(function (pluginCount) {
          expect(pluginCount).to.be.equal(0);
        });
      });
    });
  });

  describe('formatter override', function () {
    when('scribe is loaded', function () {
      it('should contain zero default formatters', function () {
        return driver.executeScript(function () {
          return window.scribe.options.defaultFormatters.length;
        }).then(function (pluginCount) {
          expect(pluginCount).to.be.equal(0);
        });
      });
    });
  });
});
