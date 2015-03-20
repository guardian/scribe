'use strict';

var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var givenContentOf = helpers.givenContentOf;
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
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

describe('defaults overrides', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('plugin override', function () {
    it('should return an empty element', function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.be.empty;
      });
    });
  });

  describe('formatter override', function () {
    givenContentOf('<p>1 &nbsp; &nbsp; 2</p>', function () {
      it('should not be formatted', function () {
        return scribeNode.getContent().then(function (content) {
          expect(content).to.have.html('<p>1 &nbsp; &nbsp; 2</p>');
        });
      });
    });
  });
});
