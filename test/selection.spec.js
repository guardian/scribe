var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');
var browserBugs = helpers.browserBugs;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

function isCaretOnNewLine() {
  return driver.executeScript(function () {
    function onNewLine() {
     return (new window.scribe.api.Selection()).isCaretOnNewLine();
    }

    return onNewLine();
  });
}

describe('selection', function () {
  describe('isCaretOnNewLine', function () {
    beforeEach(function () {
      return initializeScribe();
    });

    givenContentOf('<p><br>|</p>', function () {
      it('should return true for an empty paragraph', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.true;
        });
      });
    });

    givenContentOf('<p><strong><br>|</strong></p>', function () {
      it('should return true for a paragraph containing an empty strong element', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.true;
        });
      });
    });

    givenContentOf('<p><strong><em><strike><br>|</strike></em></strong></p>', function () {
      it('should return true for a paragraph containing multiple inline elements', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.true;
        });
      });
    });

    givenContentOf('<p><strong>bold<em>italic<strike><br>|</strike></em></strong></p>', function () {
      it('should return false for a paragraph containing multiple inline elements with text', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.false;
        });
      });
    });

    givenContentOf('<p><h2><br>|</h2></p>', function () {
      it('should return false for a paragraph containing a block element (H2 in this case)', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.false;
        });
      });
    });

    givenContentOf('<p><ul><li>First item</li><li><br>|</li></ul></p>', function () {
      it('should return false when creating a list', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.false;
        });
      });
    });

    givenContentOf('<p>a monkey|</p>', function () {
      it('should return false for a paragraph containing a monkey', function() {
        isCaretOnNewLine().then(function(result) {
          expect(result).to.be.false;
        });
      });
    });


  });
});
