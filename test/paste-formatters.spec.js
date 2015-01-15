var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var whenPastingHTMLOf = helpers.whenPastingHTMLOf;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');

var initializeExamplePasteFormatter = function () {
  function setupFormatter(done) {
    require(['example-paste-formatter'], function (ExamplePasteFormatter) {
      'use strict';
      window.scribe.use(ExamplePasteFormatter());
      done();
    });
  }
  return helpers.driver.executeAsyncScript(setupFormatter);
};

describe('paste formatters', function () {

  beforeEach(function () {
    return initializeScribe().then(function () {
      return initializeExamplePasteFormatter();
    });
  });

  describe('example paste formatter', function() {
    whenPastingHTMLOf('<p style="font-family:Comic Sans">1</p><p style="font-style:microsoft-word-junk">2</p>', function () {
      it('should strip the style attributes', function () {
        // Chrome and Firefox: '<p>1</p><p>\n</p><p>2</p>'
        return helpers.scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
        });
      });
    });
  });

});
