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

/* global describe, it, after, afterEach, before, beforeEach */

/* TODO
 * - create scribe dynamically for each context (e.g. pristine, with a plugin, etc)
 * - sanitize clearText to call scribe methods (e.g. scribe.clear() via executeScript?)
 * - rethink getInnerHTML in the light of being able to access the
 *   scribe instance; is it better to use scribe.getHTML, or how do we
 *   ensure 'content-changed' was triggered?
 * - simplify boilerplate by abstracting common test operations, e.g.
 *     when(type('hello'), function() {
 *       editorShouldContain('<p>hello</p>');
 *     });
 */

 before(function (done) {
   driver.get('http://localhost:8080/test/app/index.html').then(function () {
     done();
   });
 });

after(function (done) {
  // FIXME: Quit fails when there was an error from the WebDriver
  driver.quit().then(function () {
    done();
  });
});

var scribe;
var editorOutput;

beforeEach(function (done) {
  driver.executeScript(setupTest).then(function () {
    done();
  });

  function setupTest() {
    require([
      'scribe',
      'plugins/toolbar',
      'plugins/smart-list',
      'plugins/curly-quotes'
    ], function (
      Scribe,
      toolbar,
      smartList,
      curlyQuotes
    ) {

      'use strict';

      var scribe = new Scribe(document.querySelector('.scribe'));

      scribe.on('content-changed', updateHTML);

      function updateHTML() {
        document.querySelector('.scribe-html').textContent = scribe.el.innerHTML;
      }

      scribe.use(toolbar(document.querySelector('.toolbar')));
      scribe.use(smartList());
      scribe.use(curlyQuotes());

      scribe.initialize();

    });
  }
});

beforeEach(function (done) {
  driver.wait(function () {
    return driver.executeScript('return document.readyState').then(function (returnValue) {
      return returnValue === 'complete';
    });
  }).then(function () {
    scribe = driver.findElement(webdriver.By.id('scribe'));
    editorOutput = driver.findElement(webdriver.By.id('scribe-output'));

    scribe.getInnerHTML = function () {
      return editorOutput.getText();
    };

    scribe.click();

    done();
  });
});

afterEach(function (done) {
  // FIXME: why does this not work?
  // var clearText = new webdriver.ActionSequence(driver)
  //   .click(scribe)
  //   .keyDown(webdriver.Key.COMMAND)
  //   .sendKeys('a')
  //   .keyUp(webdriver.Key.COMMAND)
  //   .sendKeys(webdriver.Key.DELETE)
  //   .perform();

  var clearText = new webdriver.ActionSequence(driver)
    .click(scribe)
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
    scribe.getInnerHTML().then(function () {
      done();
    });
  });
});

afterEach(function (done) {
  driver.navigate().refresh().then(function () {
    done();
  });
});

when('the user types', function () {
  beforeEach(function () {
    scribe.sendKeys('1');
  });

  it('should insert the text inside of a P element', function (done) {
    scribe.getInnerHTML().then(function (innerHTML) {
      expect(innerHTML).to.equal('<p>1</p>');
      done();
    });
  });

  when('the user presses enter', function () {
    beforeEach(function () {
      scribe.sendKeys(webdriver.Key.ENTER);
    });

    it('should insert another P element', function (done) {
      scribe.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<p>1</p><p><br></p>');
        done();
      });
    });

    when('the user types', function () {
      beforeEach(function () {
        scribe.sendKeys('2');
      });

      it('should insert characters inside of the P element', function (done) {
        scribe.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>1</p><p>2</p>');
          done();
        });
      });
    });
  });
});

when('the user clicks the bold button in the toolbar and then types', function () {
  beforeEach(function () {
    scribe.click();
    driver.findElement(webdriver.By.id('bold-button')).click();
    scribe.sendKeys('1');
  });

  it('should inserts the typed characters inside of a B element, inside of a P element', function (done) {
    scribe.getInnerHTML().then(function (innerHTML) {
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
        scribe.sendKeys(prefix);
      });

      it('should create an unordered list', function (done) {
        scribe.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<ul><li><br></li></ul>');
          done();
        });
      });

      when('the user types', function () {
        beforeEach(function () {
          scribe.sendKeys('abc');
        });

        it('should insert the typed characters inside of the LI element', function (done) {
          scribe.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>abc</li></ul>');
            done();
          });
        });

        when('the user presses ENTER', function () {
          beforeEach(function () {
            scribe.sendKeys(webdriver.Key.ENTER);
          });

          it('should create a new LI element', function (done) {
            scribe.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<ul><li>abc</li><li><br></li></ul>');
              done();
            });
          });

          when('the user types', function () {
            beforeEach(function () {
              scribe.sendKeys('def');
            });

            it('should insert the typed characters inside the new LI element', function (done) {
              scribe.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li><li>def</li></ul>');
                done();
              });
            });
          });

          when('the user presses ENTER', function () {
            beforeEach(function () {
              scribe.sendKeys(webdriver.Key.ENTER);
            });

            it('should end the list and start a new P', function (done) {
              scribe.getInnerHTML().then(function (innerHTML) {
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
        scribe.sendKeys('hello');
      });

      when('the user types "' +prefix+ '"', function () {
        beforeEach(function () {
          scribe.sendKeys(prefix);
        });

        it('should write these characters and not create a list', function (done) {
          scribe.getInnerHTML().then(function (innerHTML) {
            var prefixNbsp = prefix.replace(' ', '&nbsp;');
            expect(innerHTML).to.equal('<p>hello' +prefixNbsp+ '</p>');
            done();
          });
        });
      });

      when('the user goes to the start of the line and types "' +prefix+ '"', function () {
        beforeEach(function () {
          scribe.sendKeys(webdriver.Key.LEFT);
          scribe.sendKeys(webdriver.Key.LEFT);
          scribe.sendKeys(webdriver.Key.LEFT);
          scribe.sendKeys(webdriver.Key.LEFT);
          scribe.sendKeys(webdriver.Key.LEFT);
          scribe.sendKeys(prefix);
        });

        it('should create an unordered list containing the words on the line', function (done) {
          scribe.getInnerHTML().then(function (innerHTML) {
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
      scribe.sendKeys('1. ');
    });

    it('should create an ordered list', function (done) {
      scribe.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<ol><li><br></li></ol>');
        done();
      });
    });
  });
});

describe('curly quotes plugin', function () {

  given('the caret is at the beginning of a line', function () {
    when('the user types ascii double quote', function () {
      beforeEach(function () {
        scribe.sendKeys('"');
      });

      it('should insert an opening curly double quote instead', function (done) {
        scribe.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>“<br></p>');
          done();
        });
      });
    });
  });

  given('the caret is at the end of a word', function () {
    beforeEach(function () {
      scribe.sendKeys('Hello');
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        scribe.sendKeys('"');
      });

      it('should insert a closing curly double quote instead', function (done) {
        scribe.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello”</p>');
          done();
        });
      });
    });
  });

  given('the caret is after the end of a word', function () {
    beforeEach(function () {
      scribe.sendKeys('Hello '); // Note the space!
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        scribe.sendKeys('"');
      });

      it('should insert an opening curly double quote instead', function (done) {
        scribe.getInnerHTML().then(function (innerHTML) {
          // FIXME: failing, inserts nbsp!
          expect(innerHTML).to.equal('<p>Hello “</p>');
          done();
        });
      });
    });
  });
});
