var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;
var initializeScribe = helpers.initializeScribe;
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

describe('patches', function () {
  describe('commands', function () {
    describe('insertOrderedList', function () {
      given('a parent element with a custom CSS line height', function () {
        beforeEach(function () {
          return initializeScribe();
        });

        beforeEach(function () {
          return driver.executeScript(function () {
            document.body.style.lineHeight = 2;
          });
        });

        givenContentOf('<p>|1</p>', function () {
          when('the command is executed', function () {
            beforeEach(function () {
              return executeCommand('insertOrderedList');
            });

            it('should not wrap the list contents in a SPAN with an inline style for `line-height`', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<ol><li>1<chrome-bogus-br></li></ol>');
              });
            });
          });
        });

        givenContentOf('<p>|1</p><p>2|</p>', function () {
          when('the command is executed', function () {
            beforeEach(function () {
              return executeCommand('insertOrderedList');
            });

            it('should wrap the content in an ordered list', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<ol><li>1<chrome-bogus-br></li><li>2<chrome-bogus-br></li></ol>');
              });
            });
          });
        });

        givenContentOf('<p><em>|1|</em></p>', function () {
          when('the command is executed', function () {
            beforeEach(function () {
              return executeCommand('insertOrderedList');
            });

            it('should not add an inline style for `line-height` to the EM', function() {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<ol><li><em>1</em><chrome-bogus-br></li></ol>');
              });
            });
          });
        });

        // combined case
        givenContentOf('<p>|1<em>2|</em></p>', function () {
          when('the command is executed', function () {
            beforeEach(function () {
              return executeCommand('insertOrderedList');
            });

            it('should not wrap the remaining paragraph in a SPAN with an inline style for `line-height`, ' +
              'and should not add an inline style for `line-height` to the EM', function() {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<ol><li>1<em>2</em><chrome-bogus-br></li></ol>');
              });
            });
          });
        });
      });
    });
  });

  // Specifically in Chrome
  describe('don\'t insert line-height styling on paragraph editing', function () {
    given('a parent element with a custom CSS line height', function () {
      beforeEach(function () {
        return initializeScribe();
      });

      beforeEach(function () {
        return driver.executeScript(function () {
          document.body.style.lineHeight = 2;
        });
      });

      givenContentOf('<p>|<br></p><p>hello</p>', function () {
        when('the user presses <delete>', function () {
          beforeEach(function () {
            return driver.executeScript(function () {
              window.scribe.on('content-changed', function() {
                window.lastContent = window.scribe.getHTML();
              });
            });
          });

          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.DELETE);
          });

          it('should not wrap the remaining paragraph in a SPAN with an inline style for `line-height`', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>hello<chrome-bogus-br></p>');
            });
          });

          it('should trigger the "content-updated" event without `line-height`', function() {
            /* Note we only check the content of Scribe when the last
             * 'content-updated' event was emitted; we know that an
             * event may have been emitted while the data wasn't
             * cleaned, but it should be overridden by a new event.
             */
            return driver.executeScript(function () {
              return window.lastContent;
            }).then(function(lastContent) {
              expect(lastContent).to.have.html('<p>hello<chrome-bogus-br></p>');
            });
          });

          // Check that the history is sane too
          when('the undo command is executed', function () {
            beforeEach(function () {
              return executeCommand('undo');
            });

            it('should restore the initial content', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<p><br></p><p>hello</p>');
              });
            });
          });
        });
      });

      givenContentOf('<p><br></p><p>|hello</p>', function () {
        when('the user presses <backspace>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
          });

          it('should not wrap the remaining paragraph in a SPAN with an inline style for `line-height`', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>hello<chrome-bogus-br></p>');
            });
          });
        });
      });

      givenContentOf('<p>|<br></p><p><em>hello</em></p>', function () {
        when('the user presses <delete>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.DELETE);
          });

          it('should not add an inline style for `line-height` to the EM', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p><em>hello</em><chrome-bogus-br></p>');
            });
          });
        });
      });

      givenContentOf('<p><br></p><p>|<em>hello</em></p>', function () {
        when('the user presses <backspace>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
          });

          it('should not add an inline style for `line-height` to the EM', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p><em>hello</em><chrome-bogus-br></p>');
            });
          });
        });
      });

      // combined case
      givenContentOf('<p>|<br></p><p>text <em>hello</em> world!</p>', function () {
        when('the user presses <delete>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.DELETE);
          });

          it('should not wrap the remaining paragraph in a SPAN with an inline style for `line-height`, ' +
            'and should not add an inline style for `line-height` to the EM', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>text <em>hello</em> world!<chrome-bogus-br></p>');
            });
          });
        });
      });
    });
  });

  describe('don\'t insert line-height styling on inline elements when pasting into a block element', function () {
    given('a parent element with a custom CSS line height', function () {
      beforeEach(function () {
        return initializeScribe();
      });

      beforeEach(function () {
        return driver.executeScript(function () {
          document.body.style.lineHeight = 2;
        });
      });

      givenContentOf('<p>1|</p>', function () {
        when('inserting HTML content containing an inline element', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertHTML('<b>2</b>');
            });
          });

          it('should not apply an inline style for `line-height` on the B', function() {
            // FIXME:
            if (browserBugs.firefox.insertHTMLNotMergingPElements) { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              // Firefox: '<p>1</p><p><b>2</b></p>'
              expect(innerHTML).to.have.html('<p>1<b>2</b></p>');
            });
          });
        });

        // Only occurs if the plain content is preceded by an inline element
        when('inserting HTML content containing an inline element followed by plain content', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return driver.executeScript(function () {
              window.scribe.insertHTML('<b>2</b>3');
            });
          });

          it('should not apply an inline style for `line-height` on the B', function() {
            // FIXME:
            if (browserBugs.firefox.insertHTMLNotMergingPElements) { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              // Firefox: '<p>1</p><p><b>2</b>3</p>'
              expect(innerHTML).to.have.html('<p>1<b>2</b>3</p>');
            });
          });
        });
      });
    });
  });


  describe('stay inside paragraphs when removing/replacing a selection of multiple paragraphs', function () {
    beforeEach(function () {
      return initializeScribe();
    });

    // Equivalent to Select All (Ctrl+A)
    givenContentOf('|<p>1</p>|', function () {
      when('the user presses <delete>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.DELETE);
        });

        it('delete the content but stay inside a P', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });
    });

    given('an empty editor', function () {
      when('the user presses <backspace>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should stay inside a P', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });
    });

    givenContentOf('<p>|1</p><p>2|</p><p>3</p>', function () {
      when('the user presses <backspace>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should delete the paragraphs but stay inside a P', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p><p>3</p>');
          });
        });
      });
    });

    givenContentOf('<p>1</p><p>|2</p><p>3|</p>', function () {
      when('the user types a character', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('4');
        });

        it('should replace the selected paragraphs with the inserted character', function() {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p>4</p>');
          });
        });
      });
    });
  });
});
