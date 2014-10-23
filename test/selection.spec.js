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
     return (new window.scribe.api.Selection()).isCaretOnNewLine();
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

    givenContentOf('<p><ul><li>1</li><li><br>|</li></ul></p>', function () {
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

  describe('with multiple documents', function() {
    beforeEach(function() {
      return initializeScribe().then(function() {
        return driver.executeScript(function() {
          require(['../../src/scribe'], function (Scribe) {
            'use strict';
            var iframe = window.scribe.el.ownerDocument.createElement('iframe');
            window.scribe.el.parentElement.appendChild(iframe);
            window.innerDocument = iframe.contentDocument;
            window.innerDocument.body.innerHTML = '<div class=\'iframe-scribe\'></div>';
            var innerScribe = window.innerDocument.body.querySelector('.iframe-scribe');
            window.innerScribe = new Scribe(innerScribe);
          });
        });
      });
    });

    it('should get selection', function() {
      driver.executeScript(function() {
        window.innerScribe.el.focus();
        var selection = new window.innerScribe.api.Selection();
        var isInnerDocument = selection.range.startContainer.ownerDocument === window.innerScribe.el.ownerDocument;
        var isOriginalScribeDocument = selection.range.startContainer.ownerDocument === window.scribe.el;
        return [selection, isInnerDocument, isOriginalScribeDocument];
      }).then(function(params) {
        var selection = params[0];
        var isInnerDocument = params[1];
        var isOriginalScribeDocument = params[2];
        expect(selection).to.be.defined;
        expect(isInnerDocument).to.be.true;
        expect(isOriginalScribeDocument).to.be.false;
      });
    });
  });
});
