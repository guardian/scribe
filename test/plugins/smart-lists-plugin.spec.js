var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('../helpers');
var when = helpers.when;
var given = helpers.given;
var initializeScribe = helpers.initializeScribe;
var seleniumBugs = helpers.seleniumBugs;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

/* Temporarily broken due to refactoring of <p> cleanup,
 * plugin needs to be fixed and tests re-enabled
 */
describe.skip('smart lists plugin', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['../../bower_components/scribe-plugin-smart-lists/src/scribe-plugin-smart-lists'], function (smartLists) {
        window.scribe.use(smartLists());
        done();
      });
    });
  });

  var unorderedPrefixes = ['* ', '- ', '• '];
  unorderedPrefixes.forEach(function(prefix) {
    when('the user types "' +prefix+ '"', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(prefix);
      });

      it('should create an unordered list', function () {
        // FIXME:
        if (seleniumBugs.chrome.specialCharacters) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Chrome (30): '<p>"&nbsp;</p>'
          expect(innerHTML).to.have.html('<ul><li><bogus-br></li></ul>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('abc');
        });

        it('should insert the typed characters inside of the LI element', function () {
          // FIXME:
          if (seleniumBugs.chrome.specialCharacters) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome (30): '<p>" abc</p>'
            expect(innerHTML).to.have.html('<ul><li>abc<firefox-bogus-br></li></ul>');
          });
        });

        when('the user presses <enter>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.RETURN);
          });

          it('should create a new LI element', function () {
            // FIXME:
            if (seleniumBugs.chrome.specialCharacters) { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              // Chrome (30): '<p>" abc</p><p><br></p>'
              expect(innerHTML).to.have.html('<ul><li>abc</li><li><bogus-br></li></ul>');
            });
          });

          when('the user types', function () {
            beforeEach(function () {
              return scribeNode.sendKeys('def');
            });

            it('should insert the typed characters inside the new LI element', function () {
              // FIXME:
              if (seleniumBugs.chrome.specialCharacters) { return; }

              return scribeNode.getInnerHTML().then(function (innerHTML) {
                // Chrome (30): '<p>" abc</p><p>def</p>'
                expect(innerHTML).to.have.html('<ul><li>abc</li><li>def<firefox-bogus-br></li></ul>');
              });
            });
          });

          when('the user presses <enter>', function () {
            beforeEach(function () {
              return scribeNode.sendKeys(webdriver.Key.RETURN);
            });

            it('should end the list and start a new P', function () {
              // FIXME:
              if (seleniumBugs.chrome.specialCharacters) { return; }

              return scribeNode.getInnerHTML().then(function (innerHTML) {
                // Chrome (30): '<p>" abc</p><p><br></p><p><br></p>'
                expect(innerHTML).to.have.html('<ul><li>abc</li></ul><p><bogus-br></p>');
              });
            });
          });
        });
      });
    });

    given('some content on the line', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('hello');
      });

      when('the user types "' +prefix+ '"', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(prefix);
        });

        it('should write these characters and not create a list', function () {
          // FIXME:
          if (seleniumBugs.chrome.specialCharacters) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            var prefixNbsp = prefix.replace(' ', '&nbsp;');
            // Chrome (30): '<p>hello"&nbsp;</p>'
            expect(innerHTML).to.have.html('<p>hello' +prefixNbsp+ '<firefox-bogus-br></p>');
          });
        });
      });

      when('the user goes to the start of the line and types "' +prefix+ '"', function () {
        beforeEach(function () {
          var goToStart = new webdriver.ActionSequence(driver)
            .click(scribeNode)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            /**
             * Due to an issue with Selenium when running Firefox 22, 24, and
             * 25, we need to send the prefix as individual keys.
             * TODO: revisit at a later date
             */
             // .sendKeys(prefix)
            .sendKeys(prefix[0])
            .sendKeys(prefix[1])
            .perform();

          return goToStart;
        });

        it('should create an unordered list containing the words on the line', function () {
          // FIXME:
          if (seleniumBugs.chrome.specialCharacters) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome (30): '<p>"&nbsp;hello</p>'
            expect(innerHTML).to.have.html('<ul><li>hello<bogus-br></li></ul>');
          });
        });
      });
    });
  });

  // TODO: reuse steps above for ordered lists?

  when('the user types "1. "', function () {
    beforeEach(function () {
      return scribeNode.sendKeys('1. ');
    });

    it('should create an ordered list', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.have.html('<ol><li><bogus-br></li></ol>');
      });
    });
  });
});
