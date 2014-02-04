// TODO: Running tests in multiple browsers breaks `describe/it.only`

var chai = require('chai');
var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var expect = chai.expect;

require('mocha-as-promised')();

/* global describe, it, after, afterEach, before, beforeEach */

function given() {
  var args = Object.create(arguments);
  args[0] = 'given ' + args[0];
  describe.apply(null, args);
}

function when() {
  var args = Object.create(arguments);
  args[0] = 'when ' + args[0];
  describe.apply(null, args);
}

var browserName = process.env.BROWSER_NAME;

if (! browserName) {
  throw new Error('The BROWSER_NAME environment variable must not be empty.');
}

var scribeNode;

function initializeScribe(options) {
  return driver.executeAsyncScript(setupTest, options).then(function () {
    // FIXME: why do we have to wait until after this script is executed
    // to get the node references? weird initialize error if we try to do
    // it before.
    scribeNode = driver.findElement(webdriver.By.className('scribe'));

    scribeNode.getInnerHTML = function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      });
    };
  });

  function setupTest(options, done) {
    require(['scribe'], function (Scribe) {
      'use strict';
      window.scribe = new Scribe(document.querySelector('.scribe'), options);
      done();
    });
  }
}

/* TODO
 * - rethink getInnerHTML in the light of being able to access the
 *   scribe instance; is it better to use scribeNode.getHTML, or how do we
 *   ensure 'content-changed' was triggered?
 * - simplify boilerplate by abstracting common test operations, e.g.
 *     when(type('hello'), function() {
 *       editorShouldContain('<p>hello</p>');
 *     });
 */

var server;
var driver;

before(function () {
  // Note: you need to run from the root of the project
  server = new SeleniumServer('./vendor/selenium-server-standalone-2.37.0.jar', {
    port: 4444
  });

  return server.start().then(function () {
    driver = new webdriver.Builder()
      .usingServer(server.address())
      .withCapabilities({ browserName: browserName })
      .build();

    driver.manage().timeouts().setScriptTimeout(2000);

    return driver.get('http://localhost:8080/test/app/index.html');
  });
});

before(function () {
  return driver.getCapabilities().then(function (driverCapabilities) {
    chai.use(function (chai, utils) {
      chai.Assertion.addMethod('html', function (regExpContents) {
        var obj = utils.flag(this, 'object');
        new chai.Assertion(obj).to.match(getHtmlRegExp(regExpContents));
      });
    });

    function getHtmlRegExp(string) {
      string = string.replace('<bogus-br>', '<br>');

      var fragments;
      if (driverCapabilities.caps_.browserName === 'chrome') {
        fragments = string
          .replace(/<firefox-bogus-br>/g, '')
          .split('<chrome-bogus-br>')
          .map(encodeRegExp)
          .join('<br>');
      } else if (driverCapabilities.caps_.browserName === 'firefox') {
        fragments = string
          // Unlike Chrome, Firefox is not clever and does not insert `&nbsp;`
          // for spaces with no right-hand side content.
          .replace('&nbsp;', ' ')
          .replace(/<chrome-bogus-br>/g, '')
          .split('<firefox-bogus-br>')
          .map(encodeRegExp)
          .join('<br>');
      } else {
        // Just incase
        fragments = '';
      }

      return new RegExp('^' + fragments + '$');
    }

    function encodeRegExp(string) {
      return string.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
  });
});

after(function () {
  // FIXME: Quit fails when there was an error from the WebDriver
  return driver.quit().then(function () {
    return server.stop();
  });
});

beforeEach(function () {
  return driver.wait(function () {
    return driver.executeScript('return document.readyState').then(function (returnValue) {
      return returnValue === 'complete';
    });
  });
});

afterEach(function () {
  return driver.navigate().refresh();
});

describe('undo manager', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  givenContentOf('<p>|1</p>', function () {
    when('the user types', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('2');
      });

      when('the undo command is executed', function () {
        beforeEach(function () {
          return executeCommand('undo');
        });

        it('should restore the caret and the content', function () {
          return driver.executeScript(function () {
            // Insert a marker so we can see where the caret is
            var selection = window.getSelection();
            var range = selection.getRangeAt(0);
            var marker = document.createElement('em');
            marker.classList.add('scribe-marker');
            range.insertNode(marker);
          }).then(function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p><em class="scribe-marker"></em>1</p>');
            });
          });
        });
      });
    });
  });
});

describe('formatters', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('non-breaking spaces', function () {
    given('default content', function () {
      // i.e. paste
      when('a non-breaking space is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertHTML('1&nbsp;2');
          });
        });

        it('should replace the non-breaking space character with a normal space', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1 2</p>');
          });
        });
      });
    });
  });
});

describe('P mode', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  given('default content', function () {
    when('the user types', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('1');
      });

      it('should insert the text inside of a P element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>1<firefox-bogus-br></p>');
        });
      });

      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should insert another P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p><bogus-br></p>');
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('2');
          });

          it('should insert the typed characters inside of the P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p><p>2<firefox-bogus-br></p>');
            });
          });
        });
      });
    });
  });

  describe('lists', function () {
    // The BR node denotes where the user will type.
    givenContentOf('<ul><li>|<br></li></ul>', function () {
      when('the user presses <backspace>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should delete the list and insert an empty P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });

      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should delete the list and insert an empty P element', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });
    });

    givenContentOf('<ul><li><em>|</em><br></li></ul>', function () {
      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should delete the list and insert an empty P element whilst retaining any empty inline elements', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><em></em><bogus-br></p>');
          });
        });
      });
    });

    givenContentOf(
      '<ul>' +
        '<li>1</li>' +
        '<li>|<br></li>' +
        '<li>2</li>' +
      '</ul>',
      function () {

      when('the user presses <backspace>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should split the list into two and insert an empty P element in-between', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html(
              '<ul>' +
                '<li>1</li>' +
              '</ul>' +
              '<p><bogus-br></p>' +
              '<ul>' +
                '<li>2</li>' +
              '</ul>'
            );
          });
        });
      });

      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should split the list into two and insert an empty P element in-between', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html(
              '<ul>' +
                '<li>1</li>' +
              '</ul>' +
              '<p><bogus-br></p>' +
              '<ul>' +
                '<li>2</li>' +
              '</ul>'
            );
          });
        });
      });
    });
  });

  describe('#getContent()', function () {
    it('should return an empty P element', function () {
      return driver.executeScript(function () {
        return window.scribe.getContent();
      }).then(function (html) {
        expect(html).to.have.html('<p><bogus-br></p>');
      });
    });
  });

  describe('#getHTML()', function () {
    it('should return an empty P element', function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.have.html('<p><bogus-br></p>');
      });
    });
  });
});

describe('BR mode', function () {
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
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('1<br><bogus-br>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters on the new line', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('1<br><br>2<firefox-bogus-br>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(3);
        });

        it('should insert the typed characters on the new line', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('1<br>3<br>2<firefox-bogus-br>');
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
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<i>1<br><bogus-br></i>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters after the BR element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should insert two BR elements', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('1<br><bogus-br>');
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('2');
          });

          it('should replace the second BR element with the typed characters', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
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
    given('default content and P mode enabled', function () {
      when('the command is executed with a value of "<p>1</p>2"', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return executeCommand('insertHTML', '<p>1</p>2');
        });

        it('should wrap the content in a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
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
            expect(innerHTML).to.have.html('<p>1</p><p>2</p><p><br></p><p>3</p>');
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
        it.skip('should wrap the content in a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><b>1</b>2</p>');
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
  });
});

describe('smart lists plugin', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['plugins/smart-lists'], function (smartLists) {
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
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<ul><li><bogus-br></li></ul>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('abc');
        });

        it('should insert the typed characters inside of the LI element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<ul><li>abc<firefox-bogus-br></li></ul>');
          });
        });

        when('the user presses <enter>', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.ENTER);
          });

          it('should create a new LI element', function () {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<ul><li>abc</li><li><bogus-br></li></ul>');
            });
          });

          when('the user types', function () {
            beforeEach(function () {
              return scribeNode.sendKeys('def');
            });

            it('should insert the typed characters inside the new LI element', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.have.html('<ul><li>abc</li><li>def<firefox-bogus-br></li></ul>');
              });
            });
          });

          when('the user presses <enter>', function () {
            beforeEach(function () {
              return scribeNode.sendKeys(webdriver.Key.ENTER);
            });

            it('should end the list and start a new P', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
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
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            var prefixNbsp = prefix.replace(' ', '&nbsp;');
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
            .sendKeys(prefix)
            .perform();

          return goToStart;
        });

        it('should create an unordered list containing the words on the line', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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
            return scribeNode.sendKeys(webdriver.Key.DELETE);
          });

          it('should not wrap the remaining paragraph in a SPAN with an inline style for `line-height`', function() {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>hello<chrome-bogus-br></p>');
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
            return scribeNode.getInnerHTML().then(function (innerHTML) {
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
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1<b>2</b>3</p>');
            });
          });
        });
      });
    });
  });
});

describe('curly quotes plugin', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['plugins/curly-quotes'], function (curlyQuotes) {
        window.scribe.use(curlyQuotes());
        done();
      });
    });
  });

  given('the caret is at the beginning of a line', function () {
    when('the user types ascii double quote', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('"');
      });

      it('should insert an opening curly double quote instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>“<bogus-br></p>');
        });
      });
    });

    when('the user presses <right>', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.RIGHT);
      });

      it('should not insert any content', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p><bogus-br></p>');
        });
      });
    });
  });

  given('the caret is at the end of a word', function () {
    beforeEach(function () {
      return scribeNode.sendKeys('Hello');
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('"');
      });

      it('should insert a closing curly double quote instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.have.html('<p>Hello”<firefox-bogus-br></p>');
        });
      });
    });
  });

  given('the caret is after the end of a word', function () {
    beforeEach(function () {
      return scribeNode.sendKeys('Hello '); // Note the space
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('"');
      });

      it.skip('should insert an opening curly double quote instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Disabled as Chrome inserts a bogus &nbsp; - this
          // might be a bug we want to fix though!
          expect(innerHTML).to.have.html('<p>Hello “<firefox-bogus-br></p>');
        });
      });
    });

  });


  given('default content', function () {
    when('inserting content with single quotes', function () {
      beforeEach(function () {
        // Focus it before-hand
        scribeNode.click();

        return driver.executeScript(function () {
          window.scribe.insertHTML("<p>Hello 'world'! <em class='foo'>'Great quotes'</em></p>");
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Note that the attribute quotes got changed to double quotes; no biggie though
          expect(innerHTML).to.equal('<p>Hello ‘world’! <em class="foo">‘Great quotes’</em></p>');
        });
      });
    });

    when('inserting content with double quotes', function () {
      beforeEach(function () {
        // Focus it before-hand
        scribeNode.click();

        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>Hello "world"! <em class="foo">"Great quotes"</em></p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello “world”! <em class="foo">“Great quotes”</em></p>');
        });
      });
    });
  });

});

function setContent(html) {
  return driver.executeScript(function (html) {
    window.scribe.setContent(html.replace(/\|/g, '<em class="scribe-marker"></em>'));
    if (html.match('|').length) {
      var selection = new window.scribe.api.Selection();
      selection.selectMarkers();
    }
    window.scribe.pushHistory();
  }, html);
}

function executeCommand(commandName, value) {
  return driver.executeScript(function (commandName, value) {
    var insertOrderedListCommand = window.scribe.getCommand(commandName);
    insertOrderedListCommand.execute(value);
  }, commandName, value);
}

function givenContentOf(content, fn) {
  given('content of "' + content + '"', function () {
    beforeEach(function () {
      scribeNode.click();
      return setContent(content);
    });

    fn();
  });
}
