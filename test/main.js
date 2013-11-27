var expect = require('chai').expect;
var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

// Note: you need to run from the root of the project
var server = new SeleniumServer('./vendor/selenium-server-standalone-2.37.0.jar', {
  port: 4444
});

server.start();

var driver = new webdriver.Builder()
  .usingServer(server.address())
  .withCapabilities(webdriver.Capabilities.chrome())
  // .withCapabilities(webdriver.Capabilities.firefox())
  .build();

driver.get('http://localhost:8080/test/app/index.html');

var editor = driver.findElement(webdriver.By.id('editor'));
var editorOutput = driver.findElement(webdriver.By.id('editor-output'));

editor.getInnerHTML = function () {
  return editorOutput.getText();
};

function given() {
  arguments[0] = 'given ' + arguments[0];
  describe.apply(null, arguments);
}

function when() {
  arguments[0] = 'when ' + arguments[0];
  describe.apply(null, arguments);
}

/* global it, after, afterEach, before, beforeEach */

/* TODO
 * - create editor dynamically for each context (e.g. pristine, with a plugin, etc)
 * - sanitize clearText to call editor methods (e.g. editor.clear() via executeScript?)
 * - rethink getInnerHTML in the light of being able to access the
 *   editor instance; is it better to use editor.getHTML, or how do we
 *   ensure 'content-changed' was triggered?
 * - simplify boilerplate by abstracting common test operations, e.g.
 *     when(type('hello'), function() {
 *       editorShouldContain('<p>hello</p>');
 *     });
 */

after(function (done) {
  // FIXME: Quit fails when there was an error from the WebDriver
  driver.quit().then(function () {
    done();
  });
});

afterEach(function (done) {
  // FIXME: why does this not work?
  // var clearText = new webdriver.ActionSequence(driver)
  //   .click(editor)
  //   .keyDown(webdriver.Key.COMMAND)
  //   .sendKeys('a')
  //   .keyUp(webdriver.Key.COMMAND)
  //   .sendKeys(webdriver.Key.DELETE)
  //   .perform();

  var clearText = new webdriver.ActionSequence(driver)
    .click(editor)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .sendKeys(webdriver.Key.DELETE)
    .perform();

  clearText.then(function () {
    editor.getInnerHTML().then(function (innerHTML) {
      done();
    });
  });
});

when('the user types', function () {
  beforeEach(function () {
    editor.sendKeys('1');
  });

  it('should insert the text inside of a P element', function (done) {
    editor.getInnerHTML().then(function (innerHTML) {
      expect(innerHTML).to.equal('<p>1</p>');
      done();
    });
  });

  when('the user presses enter', function () {
    beforeEach(function () {
      editor.sendKeys(webdriver.Key.ENTER);
    });

    it('should insert another P element', function (done) {
      editor.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<p>1</p><p><br></p>');
        done();
      });
    });

    when('the user types', function () {
      beforeEach(function () {
        editor.sendKeys('2');
      });

      it('should insert characters inside of the P element', function (done) {
        editor.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>1</p><p>2</p>');
          done();
        });
      });
    });
  });
});

when('the user clicks the bold button in the toolbar and then types', function () {
  beforeEach(function () {
    driver.findElement(webdriver.By.id('bold-button')).click();
    editor.sendKeys('1');
  });

  it('should inserts the typed characters inside of a B element, inside of a P element', function (done) {
    editor.getInnerHTML().then(function (innerHTML) {
      expect(innerHTML).to.equal('<p><b>1</b></p>');
      done();
    });
  });
});

describe('smart lists plugin', function () {

  var unorderedPrefixes = ['* ', '- ', '• '];
  unorderedPrefixes.forEach(function(prefix) {

    when('the user types "' +prefix+ '"', function () {
      beforeEach(function () {
        editor.sendKeys(prefix);
      });

      it('should create an unordered list', function (done) {
        editor.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<ul><li><br></li></ul>');
          done();
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          editor.sendKeys('abc');
        });

        it('should insert the typed characters inside of the LI element', function (done) {
          editor.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>abc</li></ul>');
            done();
          });
        });

        when('the user presses ENTER', function () {
          beforeEach(function () {
            editor.sendKeys(webdriver.Key.ENTER);
          });

          it('should create a new LI element', function (done) {
            editor.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<ul><li>abc</li><li><br></li></ul>');
              done();
            });
          });

          when('the user types', function () {
            beforeEach(function () {
              editor.sendKeys('def');
            });

            it('should insert the typed characters inside the new LI element', function (done) {
              editor.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li><li>def</li></ul>');
                done();
              });
            });
          });

          when('the user presses ENTER', function () {
            beforeEach(function () {
              editor.sendKeys(webdriver.Key.ENTER);
            });

            it('should end the list and start a new P', function (done) {
              editor.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li></ul><p><br></p>');
                done();
              });
            });
          });
        });
      });
    });

    given('some content on the line', function () {
      beforeEach(function () {
        editor.sendKeys('hello');
      });

      when('the user types "' +prefix+ '"', function () {
        beforeEach(function () {
          editor.sendKeys(prefix);
        });

        it('should write these characters and not create a list', function (done) {
          editor.getInnerHTML().then(function (innerHTML) {
            var prefixNbsp = prefix.replace(' ', '&nbsp;');
            expect(innerHTML).to.equal('<p>hello' +prefixNbsp+ '</p>');
            done();
          });
        });
      });

      when('the user goes to the start of the line and types "' +prefix+ '"', function () {
        beforeEach(function () {
          editor.sendKeys(webdriver.Key.LEFT);
          editor.sendKeys(webdriver.Key.LEFT);
          editor.sendKeys(webdriver.Key.LEFT);
          editor.sendKeys(webdriver.Key.LEFT);
          editor.sendKeys(webdriver.Key.LEFT);
          editor.sendKeys(prefix);
        });

        it('should create an unordered list containing the words on the line', function (done) {
          editor.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>hello<br></li></ul>');
            done();
          });
        });
      });
    });

  });

  // TODO: reuse steps above for ordered lists?

  when('the user types "1. "', function () {
    beforeEach(function () {
      editor.sendKeys('1. ');
    });

    it('should create an ordered list', function (done) {
      editor.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<ol><li><br></li></ol>');
        done();
      });
    });
  });

});
