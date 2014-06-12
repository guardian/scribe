var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');
var browserBugs = helpers.browserBugs;
var browserName = helpers.browserName;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
});

describe('commands', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('bold', function () {
    given('an empty editor', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          scribeNode.click();

          return executeCommand('bold');
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('1');
          });

          it('should insert the typed characters inside of a B element, inside of a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p><b>1</b><firefox-bogus-br></p>');
            });
          });
        });
      });
    });
  });

  describe('removeFormat', function () {
    givenContentOf('<p><i>|1|</i></p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('removeFormat');
        });

        it('should remove the formatting', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1</p>');
          });
        });
      });
    });
  });

  // TODO: one suite for OLs and ULs or duplicates?
  describe('insertOrderedList', function () {
    /**
     * Applying
     */

    givenContentOf('<p>|1</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('insertOrderedList');
        });

        it('should wrap the content in an ordered list', function () {
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

    givenContentOf('<p>1<br>2|</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('insertOrderedList');
        });

        it('should wrap the contents of the last line in an ordered list', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome:  '<p>1<br></p><ol><li>2<br></li></ol>'
            // Firefox: '<p>1<br></p><ol><li>2</li></ol><p><br></p>'
            expect(innerHTML).to.have.html('<p>1<br></p><ol><li>2<chrome-bogus-br></li></ol>');
          });
        });
      });
    });

    /**
     * Unapplying
     */

    givenContentOf('<ol><li>1|</li></ol>', function () {

      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('insertOrderedList');
        });

        it('should remove the list and replace the list item with a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p>');
          });
        });
      });
    });

    givenContentOf('<ol><li>|1</li><li>2|</li></ol>', function () {

      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('insertOrderedList');
        });

        it('should remove the list and replace each list item with a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // TODO: test selection
            expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
          });
        });
      });
    });

    givenContentOf('<ol><li>1</li><li>|2</li><li>3|</li><li>4</li></ol>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('insertOrderedList');
        });

        it('should split the list into two and replace each selected list item with a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // TODO: test selection
            expect(innerHTML).to.have.html('<ol><li>1</li></ol><p>2</p><p>3</p><ol><li>4</li></ol>');
          });
        });
      });
    });
  });

  describe('insertHTML', function () {
    given('P mode enabled', function () {
      givenContentOf('<p>1|</p>', function () {
        when('the command is executed with a value of "<p>2</p>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<p>2</p>');
          });

          it('should merge the inserted P element into the existing P element', function () {
            if (browserName === 'firefox') { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>12</p>');
            });
          });
        });
      });

      given('default content', function () {
        when('the command is executed with a value of "<p>1</p>2"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<p>1</p>2');
          });

          it('should wrap the content in a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p><p>2<chrome-bogus-br></p>');
            });
          });
        });

        when('the command is executed with a value of "<p>1<b>2</b></p>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<p>1<b>2</b></p>');
          });

          it('should insert the HTML as it is', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1<b>2</b></p>');
            });
          });
        });

        when('the command is executed with a value of "<p>1</p>2<br>3"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<p>1</p>2<br>3');
          });

          it('should wrap the content in a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p><p>2<br>3<chrome-bogus-br></p>');
            });
          });
        });

        when('the command is executed with a value of "<b>1</b>2"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<b>1</b>2');
          });

          // TODO: This is a shortcoming of the `insertHTML` command
          it('should wrap the content in a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p><b>1</b>2<chrome-bogus-br></p>');
            });
          });
        });

        when('the command is executed with a value of "<blockquote>1</blockquote>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<blockquote>1</blockquote>');
          });

          it('should wrap the content of the BLOCKQUOTE element in a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<blockquote><p>1</p></blockquote>');
            });
          });
        });

        when('the command is executed with a value of "<ul>1</ul>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<ul>1</ul>');
          });

          it.skip('should wrap the content of the UL element in a LI element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<ul><li>1</li></ul>');
            });
          });
        });

        when('the command is executed with a value of "<ol>1</ol>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<ol>1</ol>');
          });

          it.skip('should wrap the content of the OL element in a LI element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<ol><li>1</li></ol>');
            });
          });
        });
      });

      givenContentOf('<p>1|</p>', function () {
        when('the command is executed with a value of "<b>2</b>"', function () {
          beforeEach(function () {
            // Focus it before-hand
            scribeNode.click();

            return executeCommand('insertHTML', '<b>2</b>');
          });

          it('should wrap the content in a P element', function () {
            // FIXME:
            if (browserBugs.firefox.insertHTMLNotMergingPElements) { return; }

            return scribeNode.getInnerHTML().then(function (innerHTML) {
              // Firefox: '<p>1</p><p><b>2</b></p>'
              expect(innerHTML).to.have.html('<p>1<b>2</b></p>');
            });
          });
        });
      });
    });
  });

  describe('indent', function () {
    givenContentOf('<p>|1|</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('indent');
        });

        /**
         * FIXME: Fails in Chrome. Bogus P element?
         */
        it('should wrap the P element in a BLOCKQUOTE element', function () {
          if (browserName === 'chrome') { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome: '<blockquote><p>1</p></blockquote><p></p>''
            expect(innerHTML).to.have.html('<blockquote><p>1</p></blockquote>');
          });
        });
      });
    });

    givenContentOf('<p>1|</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('indent');
        });

        it('should wrap the P element in a BLOCKQUOTE element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<blockquote><p>1</p></blockquote>');
          });
        });
      });
    });

    givenContentOf('<p>|1</p><ul><li>2|</li></ul>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('indent');
        });

        it.skip('should wrap the P and UL elements in a BLOCKQUOTE element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<blockquote><p>1</p><ul><li>2</li></ul></blockquote>');
          });
        });
      });
    });

    givenContentOf('<p>|1<br>2|</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('indent');
        });

        it('should wrap the P element in a BLOCKQUOTE element', function () {
          /*
           * FIXME: Fails in Chrome. Chrome converts BRs to Ps: http://jsbin.com/zeti/2/edit?js,output
           */
          if (browserName === 'chrome') { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome: '<blockquote><p>1</p><p>2</p></blockquote>"''
            expect(innerHTML).to.have.html('<blockquote><p>1<br>2</p></blockquote>');
          });
        });
      });
    });

    givenContentOf('<p>1|<br>2</p>', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          return executeCommand('indent');
        });

        it('should wrap the P element in a BLOCKQUOTE element', function () {
          /*
           * FIXME: Fails in Firefox.
           * Firefox does not perform transformation upon Ps containing BRs.
           * As per: http://jsbin.com/yiyaq/1/edit?js,output
           */
          /*
           * FIXME: Fails in Chrome. Chrome converts BRs to Ps: http://jsbin.com/zeti/2/edit?js,output
           */
          if (browserName === 'firefox' || browserName === 'chrome') { return; }

          return scribeNode.getInnerHTML().then(function (innerHTML) {
            // Chrome: '<blockquote><p>1</p></blockquote><p>2</p>''
            // Firefox: '<p>1<br>2</p>'
            expect(innerHTML).to.have.html('<blockquote><p>1<br>2</p></blockquote>');
          });
        });
      });
    });
  });
});
