var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');
var seleniumBugs = helpers.seleniumBugs;
var browserBugs = helpers.browserBugs;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

describe('inline elements mode', function () {
  beforeEach(function () {
    return initializeScribe({ allowBlockElements: false });
  });

  // Without right-hand side content
  givenContentOf('1|', function () {
    it('should append a bogus BR to the content', function () {

      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.have.html('1<bogus-br>');
      });
    });

    when('the user presses <enter>', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.RETURN);
      });

      it('should create a new line by inserting a BR element', function () {
        // FIXME:
        if (seleniumBugs.firefox.inlineElementsMode) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '1<br><br><br>'
          expect(innerHTML).to.have.html('1<br><bogus-br>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters on the new line', function () {
          // FIXME:
          if (seleniumBugs.firefox.inlineElementsMode) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '1<br><br>2<br>'
            expect(innerHTML).to.have.html('1<br>2<firefox-bogus-br>');
          });
        });
      });
    });
  });

  // With right-hand side content
  givenContentOf('1|<br>2', function () {
    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.have.html('1<br>2<bogus-br>');
      });
    });

    when('the user presses <enter>', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.RETURN);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        // FIXME:
        if (browserBugs.chrome.treeWalkerAndDocumentFragments) { return; }
        // FIXME:
        if (seleniumBugs.firefox.inlineElementsMode) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '1<br><br><br>2'
          // Chrome (26, 27, 28): "1<br><br><br>2"
          expect(innerHTML).to.have.html('1<br><br>2');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(3);
        });

        it('should insert the typed characters on the new line', function () {
          // FIXME:
          if (browserBugs.chrome.treeWalkerAndDocumentFragments) { return; }
          // FIXME:
          if (seleniumBugs.firefox.inlineElementsMode) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '1<br><br>3<br>2'
            // Chrome (26, 27, 28): "1<br>3<br><br>2"
            expect(innerHTML).to.have.html('1<br>3<br>2');
          });
        });
      });
    });
  });

  // Inside an inline element
  givenContentOf('<i>1|</i>', function () {
    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.have.html('<i>1</i><bogus-br>');
      });
    });

    when('the user presses <enter>', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.RETURN);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        // FIXME:
        if (seleniumBugs.firefox.inlineElementsMode) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '<i>1<br><br><br></i>'
          expect(innerHTML).to.have.html('<i>1<br><bogus-br></i>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters after the BR element', function () {
          // FIXME:
          if (seleniumBugs.firefox.inlineElementsMode) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '<i>1<br><br>2<br></i>'
            expect(innerHTML).to.have.html('<i>1<br>2<firefox-bogus-br></i>');
          });
        });
      });
    });
  });

  given('default content', function () {
    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.have.html('<bogus-br>');
      });
    });

    when('the user types', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('1');
      });

      it('should insert the typed characters', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('1<firefox-bogus-br>');
        });
      });

      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should insert two BR elements', function () {
          // FIXME:
          if (seleniumBugs.firefox.inlineElementsMode) { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Firefox (23, 24, 25): '1<br><br><br>'
            expect(innerHTML).to.have.html('1<br><bogus-br>');
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('2');
          });

          it('should replace the second BR element with the typed characters', function () {
            // FIXME:
            if (seleniumBugs.firefox.inlineElementsMode) { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              // Firefox (23, 24, 25): '1<br><br>2<br>'
              expect(innerHTML).to.have.html('1<br>2<firefox-bogus-br>');
            });
          });
        });
      });
    });
  });

  describe('#getContent()', function () {
    it('should return nothing', function () {
      return driver.executeScript(function () {
        return window.scribe.getContent();
      }).then(function (html) {
        expect(html).to.equal('');
      });
    });
  });

  describe('#getHTML()', function () {
    it('should return a bogus BR', function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.have.html('<bogus-br>');
      });
    });
  });
});
