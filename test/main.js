var expect = require('chai').expect;
var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

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

after(function (done) {
  // FIXME: Quit fails when there was an error from the WebDriver
  driver.quit().then(function () {
    return server.stop();
  }).then(function () {
    done();
  });
});

beforeEach(function (done) {
  driver.wait(function () {
    return driver.executeScript('return document.readyState').then(function (returnValue) {
      return returnValue === 'complete';
    });
  }).then(function () {
    done();
  });
});

afterEach(function (done) {
  driver.navigate().refresh().then(function () {
    done();
  });
});

describe('undo manager', function () {
  beforeEach(function (done) {
    initializeScribe().then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeScript(function () {
      window.scribe.initialize();
    }).then(function () {
      done();
    });
  });

  given('content of "<p>1</p>"', function () {
    beforeEach(function (done) {
      driver.executeScript(function () {
        window.scribe.setContent('<p>1</p>');
      }).then(function () {
        done();
      });
    });

    when('the user focuses the editor', function () {
      beforeEach(function (done) {
        // Focus is given via clicking or tabbing to the element. When we
        // programatically giving focus, the caret is inserted at the beginning.
        // `scribeNode.click()` seems to place the caret at the end
        driver.executeScript(function () {
          window.scribe.el.focus();
        }).then(function () {
          done();
        });
      });

      when('the user types', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys('2').then(function () {
            done();
          });
        });

        when('the undo command is executed', function () {
          beforeEach(function (done) {
            driver.executeScript(function () {
              window.scribe.getCommand('undo').execute();
            }).then(function () {
              done();
            });
          });

          it('should restore the caret and the content', function (done) {
            driver.executeScript(function () {
              // Insert a marker so we can see where the caret is
              var selection = window.getSelection();
              var range = selection.getRangeAt(0);
              var marker = document.createElement('em');
              marker.classList.add('scribe-marker');
              range.insertNode(marker);
            }).then(function () {
              scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<p><em class="scribe-marker"></em>1</p>');
                done();
              });
            });
          });
        });
      });
    });
  });
});

describe('P mode', function () {
  beforeEach(function (done) {
    initializeScribe().then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeScript(function () {
      window.scribe.initialize();
    }).then(function () {
      done();
    });
  });

  given('no content', function () {
    when('the user types', function () {

      beforeEach(function (done) {
        scribeNode.sendKeys('1').then(function () {
          done();
        });
      });

      it('should insert the text inside of a P element', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>1</p>');
          done();
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
            done();
          });
        });

        it('should insert another P element', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<p>1</p><p><br></p>');
            done();
          });
        });

        when('the user types', function () {
          beforeEach(function (done) {
            scribeNode.sendKeys('2').then(function () {
              done();
            });
          });

          it('should insert the typed characters inside of the P element', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p>1</p><p>2</p>');
              done();
            });
          });
        });
      });
    });
  });

  describe.skip('#getHTML()', function () {
    it('should return an empty P element', function (done) {
      driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.equal('<p></p>');
        done();
      });
    });
  });
});

describe('BR mode', function () {

  beforeEach(function (done) {
    initializeScribe({ allowBlockElements: false }).then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeScript(function () {
      window.scribe.initialize();
    }).then(function () {
      done();
    });
  });

  given('content of "1<br>2"', function () {
    beforeEach(function (done) {
      driver.executeScript(function () {
        window.scribe.setContent('1<br>2');
      }).then(function () {
        done();
      });
    });

    it('should append a bogus BR to the content', function (done) {
      scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('1<br>2<br>');
        done();
      });
    });

    when('the user places their caret at the end of a line', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys(webdriver.Key.RIGHT).then(function () {
          done();
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
            done();
          });
        });

        it('should create a new line by inserting a BR element', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('1<br><br>2<br>');
            done();
          });
        });

        when('the user types', function () {
          beforeEach(function (done) {
            scribeNode.sendKeys('3').then(function () {
              done();
            });
          });

          it('should insert the typed characters on the new line', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('1<br>3<br>2<br>');
              done();
            });
          });
        });
      });
    });
  });

  given('content of "<i>1</i>', function () {
    beforeEach(function (done) {
      driver.executeScript(function () {
        window.scribe.setContent('<i>1</i>');
      }).then(function () {
        done();
      });
    });

    when('the user places their caret at the end of a line', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys(webdriver.Key.RIGHT).then(function () {
          done();
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
            done();
          });
        });

        it.skip('should insert a BR element after the content', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<i>1</i><br>');
            done();
          });
        });
      });
    });
  });

  given('no content', function () {
    it('should append a bogus BR to the content', function (done) {
      scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<br>');
        done();
      });
    });

    when('the user types', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys('1').then(function () {
          done();
        });
      });

      it('should insert the typed characters', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('1');
          done();
        });
      });

      when('the user presses ENTER', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
            done();
          });
        });

        it('should insert two BR elements', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('1<br><br>');
            done();
          });
        });

        when('the user types', function () {
          beforeEach(function (done) {
            scribeNode.sendKeys('2').then(function () {
              done();
            });
          });

          it('should replace the second BR element with the typed characters', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('1<br>2');
              done();
            });
          });
        });
      });
    });
  });

  describe.skip('#getHTML()', function () {
    it('should return an empty string', function (done) {
      driver.executeScript(function () {
        return window.scribe.getHTML();
      }).then(function (html) {
        expect(html).to.equal('');
        done();
      });
    });
  });
});

describe('commands', function () {

  beforeEach(function (done) {
    initializeScribe().then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeScript(function () {
      window.scribe.initialize();
    }).then(function () {
      done();
    });
  });

  describe('bold', function () {
    given('an empty editor', function () {
      when('the command is executed', function () {
        beforeEach(function (done) {
          scribeNode.click();

          driver.executeScript(function () {
            var boldCommand = window.scribe.getCommand('bold');
            boldCommand.execute();
          }).then(function () {
            done();
          });
        });

        when('the user types', function () {
          beforeEach(function (done) {
            scribeNode.sendKeys('1').then(function () {
              done();
            });
          });

          it('should inserts the typed characters inside of a B element, inside of a P element', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p><b>1</b></p>');
              done();
            });
          });
        });
      });
    });
  });

  describe('removeFormat', function () {
    given('content of "<i>1</i>"', function () {
      beforeEach(function (done) {
        driver.executeScript(function () {
          window.scribe.setContent('<i>1</i>');
        }).then(function () {
          done();
        });
      });

      when('all the content is selected', function () {
        beforeEach(function (done) {
          var selectAll = new webdriver.ActionSequence(driver)
            .click(scribeNode)
            .keyDown(webdriver.Key.SHIFT)
            .sendKeys(webdriver.Key.RIGHT)
            .perform();

          selectAll.then(function () {
            done();
          });
        });

        when('the command is executed', function () {
          beforeEach(function (done) {
            scribeNode.click();

            driver.executeScript(function () {
              var removeFormatCommand = window.scribe.getCommand('removeFormat');
              removeFormatCommand.execute();
            }).then(function () {
              done();
            });
          });

          it('should remove the formatting', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('1');
              done();
            });
          });
        });
      });
    });
  });
});

describe('smart lists plugin', function () {

  beforeEach(function (done) {
    initializeScribe().then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeAsyncScript(function (done) {
      require(['plugins/smart-lists'], function (smartLists) {
        window.scribe.use(smartLists());
        window.scribe.initialize();
        done();
      });
    }).then(function () {
      done();
    });
  });

  var unorderedPrefixes = ['* ', '- ', '• '];
  unorderedPrefixes.forEach(function(prefix) {

    when('the user types "' +prefix+ '"', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys(prefix).then(function () {
          done();
        });
      });

      it('should create an unordered list', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<ul><li><br></li></ul>');
          done();
        });
      });

      when('the user types', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys('abc').then(function () {
            done();
          });
        });

        it('should insert the typed characters inside of the LI element', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>abc</li></ul>');
            done();
          });
        });

        when('the user presses ENTER', function () {
          beforeEach(function (done) {
            scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
              done();
            });
          });

          it('should create a new LI element', function (done) {
            scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<ul><li>abc</li><li><br></li></ul>');
              done();
            });
          });

          when('the user types', function () {
            beforeEach(function (done) {
              scribeNode.sendKeys('def').then(function () {
                done();
              });
            });

            it('should insert the typed characters inside the new LI element', function (done) {
              scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li><li>def</li></ul>');
                done();
              });
            });
          });

          when('the user presses ENTER', function () {
            beforeEach(function (done) {
              scribeNode.sendKeys(webdriver.Key.ENTER).then(function () {
                done();
              });
            });

            it('should end the list and start a new P', function (done) {
              scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<ul><li>abc</li></ul><p><br></p>');
                done();
              });
            });
          });
        });
      });
    });

    given('some content on the line', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys('hello').then(function () {
          done();
        });
      });

      when('the user types "' +prefix+ '"', function () {
        beforeEach(function (done) {
          scribeNode.sendKeys(prefix).then(function () {
            done();
          });
        });

        it('should write these characters and not create a list', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            var prefixNbsp = prefix.replace(' ', '&nbsp;');
            expect(innerHTML).to.equal('<p>hello' +prefixNbsp+ '</p>');
            done();
          });
        });
      });

      when('the user goes to the start of the line and types "' +prefix+ '"', function () {
        beforeEach(function (done) {
          var goToStart = new webdriver.ActionSequence(driver)
            .click(scribeNode)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(webdriver.Key.LEFT)
            .sendKeys(prefix)
            .perform();

          goToStart.then(function () {
            done();
          });
        });

        it('should create an unordered list containing the words on the line', function (done) {
          scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.equal('<ul><li>hello<br></li></ul>');
            done();
          });
        });
      });
    });

  });

  // TODO: reuse steps above for ordered lists?

  when('the user types "1. "', function () {
    beforeEach(function (done) {
      scribeNode.sendKeys('1. ').then(function () {
        done();
      });
    });

    it('should create an ordered list', function (done) {
      scribeNode.getInnerHTML().then(function (innerHTML) {
        expect(innerHTML).to.equal('<ol><li><br></li></ol>');
        done();
      });
    });

  });

});

describe('curly quotes plugin', function () {

  beforeEach(function (done) {
    initializeScribe().then(function () {
      done();
    });
  });

  beforeEach(function (done) {
    driver.executeAsyncScript(function (done) {
      require(['plugins/curly-quotes'], function (curlyQuotes) {
        window.scribe.use(curlyQuotes());
        window.scribe.initialize();
        done();
      });
    }).then(function () {
      done();
    });
  });

  given('the caret is at the beginning of a line', function () {
    when('the user types ascii double quote', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys('"').then(function () {
          done();
        });
      });

      it('should insert an opening curly double quote instead', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>“<br></p>');
          done();
        });
      });
    });

    when('the user presses the Right key', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys(webdriver.Key.RIGHT).then(function () {
          done();
        });
      });

      it('should not insert any content', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p><br></p>');
          done();
        });
      });
    });
  });

  given('the caret is at the end of a word', function () {
    beforeEach(function (done) {
      scribeNode.sendKeys('Hello').then(function () {
        done();
      });
    });

    when('the user types ascii double quote', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys('"').then(function () {
          done();
        });
      });

      it('should insert a closing curly double quote instead', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello”</p>');
          done();
        });
      });
    });
  });

  given('the caret is after the end of a word', function () {
    beforeEach(function (done) {
      scribeNode.sendKeys('Hello ').then(function () { // Note the space
        done();
      });
    });

    when('the user types ascii double quote', function () {
      beforeEach(function (done) {
        scribeNode.sendKeys('"').then(function () {
          done();
        });
      });

      it.skip('should insert an opening curly double quote instead', function (done) {
        scribeNode.getInnerHTML().then(function (innerHTML) {
          // FIXME: failing, inserts nbsp!
          expect(innerHTML).to.equal('<p>Hello “</p>');
          done();
        });
      });
    });

  });

});
