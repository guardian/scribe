var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var given = helpers.given;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

describe('iframe mode', function () {
  given('default settings', function () {
    beforeEach(function () {
      return initializeScribe({ iframe: true });
    });

    it('should create an iframe element', function () {
      driver.executeScript(function () {
        return document.querySelector('iframe').tagName;
      }).then(function (iframeTag) {
        expect(iframeTag).to.exist;
        expect(iframeTag).to.equal('IFRAME');
      });
    });

    it('iframe class should be "scribe-rte-iframe"', function () {
      driver.executeScript(function () {
        return document.querySelector('iframe').className;
      }).then(function (iframeClass) {
        expect(iframeClass).to.equal('scribe-rte-iframe');
      });
    });

    it('should set iframe body as scribe element', function () {
      return driver.executeScript(function () {
        return document.querySelector('iframe').contentWindow.document.body.isContentEditable;
      }).then(function (bodyHtml) {
        expect(bodyHtml).to.be.true;
      });
    });
  });

  given('css path', function () {
    beforeEach(function () {
      return initializeScribe({
        iframe: {
          cssUrl: '//example.com/css/path'
        }
      });
    });

    it('should add a link tag with the css path', function () {
      return driver.executeScript(function () {
        return document.querySelector('iframe').contentWindow.document.head.innerHTML;
      }).then(function (headHtml) {
        expect(headHtml).to.have.html('<link type="text/css" rel="stylesheet" href="//example.com/css/path">');
      });
    });
  });

  given('content security policy', function () {
    beforeEach(function () {
      return initializeScribe({
        iframe: {
          contentSecurityPolicy: "default-src 'self'; img-src 'self' data:; media-src mediastream:"
        }
      });
    });

    it('should add a meta tag with content settings', function () {
      return driver.executeScript(function () {
        return document.querySelector('iframe').contentWindow.document.head.innerHTML;
      }).then(function (headHtml) {
        expect(headHtml).to.have.html('<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; img-src \'self\' data:; media-src mediastream:">');
      });
    });
  });
});
