var expect = require('chai').expect;
var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

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

before(function (done) {
  // Note: you need to run from the root of the project
  server = new SeleniumServer('./vendor/selenium-server-standalone-2.37.0.jar', {
    port: 4444
  });

  server.start().then(function () {
    driver = new webdriver.Builder()
      .usingServer(server.address())
      // TODO: firefox
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();

    driver.manage().timeouts().setScriptTimeout(2000);

    driver.get('http://localhost:8080/test/app/index.html').then(function () {
      done();
    });
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

  beforeEach(function () {
    return driver.executeScript(function () {
      window.scribe.initialize();
    });
  });

  given('content of "<p>|1</p>"', function () {
    setContent('<p>|1</p>');

    when('the user types', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('2');
      });

      when('the undo command is executed', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.getCommand('undo').execute();
          });
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

describe('P mode', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeScript(function () {
      window.scribe.initialize();
    });
  });

  given('no content', function () {
    when('the user types', function () {

      beforeEach(function () {
        return scribeNode.sendKeys('1');
      });

      it('should insert the text inside of a P element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>1</p>');
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should insert another P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1</p><p><br></p>');
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('2');
          });

          it('should insert the typed characters inside of the P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p>1</p><p>2</p>');
            });
          });
        });
      });
    });
  });

  describe('lists', function () {
    // The BR node denotes where the user will type.
    given('content of "<ul><li>|<br></li></ul>"', function () {
      setContent('<ul><li>|<br></li></ul>');

      when('the user presses backspace', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should delete the list and insert an empty P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p><br></p>');
          });
        });
      });

      when('the user presses enter', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should delete the list and insert an empty P element', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p><br></p>');
          });
        });
      });
    });

    given('content of "' +
        '<ul>' +
          '<li>1</li>' +
          '<li>|<br></li>' +
          '<li>2</li>' +
        '</ul>' +
      '"',
      function () {
      setContent(
        '<ul>' +
          '<li>1</li>' +
          '<li>|<br></li>' +
          '<li>2</li>' +
        '</ul>'
      );

      when('the user presses backspace', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.BACK_SPACE);
        });

        it('should split the list into two and insert an empty P element in-between', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal(
              '<ul>' +
                '<li>1</li>' +
              '</ul>' +
              '<p><br></p>' +
              '<ul>' +
                '<li>2</li>' +
              '</ul>'
            );
          });
        });
      });

      when('the user presses enter', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should split the list into two and insert an empty P element in-between', function () {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal(
              '<ul>' +
                '<li>1</li>' +
              '</ul>' +
              '<p><br></p>' +
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
        expect(html).to.equal('<p><br></p>');
      });
    });
  });

  describe('#getHTML()', function () {
    it('should return an empty P element', function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.equal('<p><br></p>');
      });
    });
  });
});

describe('BR mode', function () {
  beforeEach(function () {
    return initializeScribe({ allowBlockElements: false });
  });

  beforeEach(function () {
    return driver.executeScript(function () {
      window.scribe.initialize();
    });
  });

  // Without right-hand side content
  given('content of "1|"', function () {
    setContent('1|');

    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('1<br>');
      });
    });

    when('the user presses ENTER', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('1<br><br>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters on the new line', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('1<br>2');
          });
        });
      });
    });
  });

  // With right-hand side content
  given('content of "1|<br>2"', function () {
    setContent('1|<br>2');

    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('1<br>2<br>');
      });
    });

    when('the user presses ENTER', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('1<br><br>2');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(3);
        });

        it('should insert the typed characters on the new line', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('1<br>3<br>2');
          });
        });
      });
    });
  });

  // Inside an inline element
  given('content of "<i>1|</i>', function () {
    setContent('<i>1|</i>');

    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<i>1</i><br>');
      });
    });

    when('the user presses ENTER', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.ENTER);
      });

      it('should delete the bogus BR element and create a new line by inserting a BR element', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<i>1<br><br></i>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(2);
        });

        it('should insert the typed characters after the BR element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<i>1<br>2</i>');
          });
        });
      });
    });
  });

  given('no content', function () {
    it('should append a bogus BR to the content', function () {
      return scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<br>');
      });
    });

    when('the user types', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('1');
      });

      it('should insert the typed characters', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('1');
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.ENTER);
        });

        it('should insert two BR elements', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('1<br><br>');
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('2');
          });

          it('should replace the second BR element with the typed characters', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('1<br>2');
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
    it('should return nothing', function () {
      return driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.equal('<br>');
      });
    });
  });
});

describe('commands', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeScript(function () {
      window.scribe.initialize();
    });
  });

  describe('bold', function () {
    given('an empty editor', function () {
      when('the command is executed', function () {
        beforeEach(function () {
          scribeNode.click();

          return driver.executeScript(function () {
            var boldCommand = window.scribe.getCommand('bold');
            boldCommand.execute();
          });
        });

        when('the user types', function () {
          beforeEach(function () {
            return scribeNode.sendKeys('1');
          });

          it('should inserts the typed characters inside of a B element, inside of a P element', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p><b>1</b></p>');
            });
          });
        });
      });
    });
  });

  describe('removeFormat', function () {
    given('content of "<p><i>|1|</i></p>"', function () {
      setContent('<p><i>|1|</i></p>');

      when('the command is executed', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            var removeFormatCommand = window.scribe.getCommand('removeFormat');
            removeFormatCommand.execute();
          });
        });

        it('should remove the formatting', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1</p>');
          });
        });
      });
    });
  });

  // TODO: find a way to separate tests for browser patches from normal
  // functionality.
  // TODO: one suite for OLs and ULs or duplicates?
  describe('insertOrderedList', function () {
    given('content of "<p>|1</p>"', function () {
      setContent('<p>|1</p>');

      when('the command is executed', function () {
        beforeEach(function () {
          scribeNode.click();

          return driver.executeScript(function () {
            var removeFormatCommand = window.scribe.getCommand('insertOrderedList');
            removeFormatCommand.execute();
          });
        });

        it('should wrap the content in an ordered list', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ol><li>1<br></li></ol>');
          });
        });
      });

      // FIXME: re-organise, this is a browser bug, not a feature
      when('a parent element has a custom CSS line height', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            document.body.style.lineHeight = 2;
          });
        });

        when('the command is executed', function () {
          beforeEach(function () {
            scribeNode.click();

            return driver.executeScript(function () {
              var removeFormatCommand = window.scribe.getCommand('insertOrderedList');
              removeFormatCommand.execute();
            });
          });

          it('should wrap the content in an ordered list', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<ol><li>1<br></li></ol>');
            });
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
        window.scribe.initialize();
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
          expect(innerHTML).to.equal('<ul><li><br></li></ul>');
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('abc');
        });

        it('should insert the typed characters inside of the LI element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>abc</li></ul>');
          });
        });

        when('the user presses ENTER', function () {
          beforeEach(function () {
            return scribeNode.sendKeys(webdriver.Key.ENTER);
          });

          it('should create a new LI element', function () {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              return expect(innerHTML).to.equal('<ul><li>abc</li><li><br></li></ul>');
            });
          });

          when('the user types', function () {
            beforeEach(function () {
              return scribeNode.sendKeys('def');
            });

            it('should insert the typed characters inside the new LI element', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li><li>def</li></ul>');
              });
            });
          });

          when('the user presses ENTER', function () {
            beforeEach(function () {
              return scribeNode.sendKeys(webdriver.Key.ENTER);
            });

            it('should end the list and start a new P', function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li></ul><p><br></p>');
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
            expect(innerHTML).to.equal('<p>hello' +prefixNbsp+ '</p>');
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
            expect(innerHTML).to.equal('<ul><li>hello<br></li></ul>');
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
        expect(innerHTML).to.equal('<ol><li><br></li></ol>');
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
        window.scribe.initialize();
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
          expect(innerHTML).to.equal('<p>“<br></p>');
        });
      });
    });

    when('the user presses the Right key', function () {
      beforeEach(function () {
        return scribeNode.sendKeys(webdriver.Key.RIGHT);
      });

      it('should not insert any content', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p><br></p>');
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
          expect(innerHTML).to.equal('<p>Hello”</p>');
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
          // FIXME: failing, inserts nbsp!
          expect(innerHTML).to.equal('<p>Hello “</p>');
        });
      });
    });

  });

});

function setContent(html) {
  beforeEach(function () {
    return driver.executeAsyncScript(function (html, done) {
      require(['./api/selection'], function (Selection) {
        window.scribe.setContent(html.replace(/\|/g, '<em class="scribe-marker"></em>'));
        if (html.match('|').length) {
          var selection = new scribe.api.Selection();
          selection.selectMarkers(window.scribe.el);
        }
        done();
      });
    }, html);
  });
}
