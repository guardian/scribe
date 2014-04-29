/**
 * TODO:
 * - Conditional skip inside of tests: https://github.com/visionmedia/mocha/issues/591
 * - Move out unit tests (wherever we are testing individual methods; lots of
 *   places!)
 * - Abstract plugin tests
 */

var assign = require('lodash-node/modern/objects/assign');
var chai = require('chai');
var contains = require('lodash-node/modern/collections/contains');
var Q = require('q');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
var webdriver = require('selenium-webdriver');

chai.Assertion.includeStack = true;

var expect = chai.expect;

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
    require.config({
      paths: {
        'scribe-plugin-sanitizer': '../bower_components/scribe-plugin-sanitizer/scribe-plugin-sanitizer'
      }
    });

    require(['scribe'], function (Scribe) {
      'use strict';
      /**
       * In Firefox, the options object appears to be frozen. I’m unable
       * to find any documentation on why this is happening at
       * http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebDriver.html.
       * We create a new object with the previous object as its prototype to
       * overcome this issue.
       */
      window.scribe = new Scribe(document.querySelector('.scribe'), Object.create(options));
      done();
    });
  }
}

var browserName = process.env.BROWSER_NAME;
var browserVersion = process.env.BROWSER_VERSION;
var platform = process.env.PLATFORM;

if (! browserName) {
  throw new Error('The BROWSER_NAME environment variable must not be empty.');
}

/**
 * These are issues against Selenium that we currently bypass in order to
 * achieve a green build. If you perform the actions manually, they are fine.
 */
var seleniumBugs = {
  chrome: {
    /**
     * Chrome (30) does not properly send • or “ keys
     * As per issue: https://code.google.com/p/selenium/issues/detail?id=6998
     */
    specialCharacters: browserName === 'chrome' && browserVersion === '30'
  },
  firefox: {
    /**
     * In Firefox 23, 24, and 25, Selenium’s "RETURN" key is somehow different
     * to the manual event. My hypothesis is that it is sent twice.
     */
    inlineElementsMode: browserName === 'firefox' && contains(['23', '24', '25'], browserVersion),
    /**
     * In Firefox 23, 24, and 25, Selenium’s "\"" key is somehow different to
     * the manual event — *only when the curly quotes plugin is enabled.*
     * My hypothesis is that it is sent thrice.
     */
    curlyQuotes: browserName === 'firefox' && contains(['21', '23', '24', '25', '26'], browserVersion)
  }
};

/**
 * These are issues against browsers that we currently bypass in order to
 * achieve a green build — because the problem is not worth fixing.
 */
var browserBugs = {
  chrome: {
    /**
     * In Chrome <= 28, `TreeWalker` does not work properly with
     * `DocumentFragment`s, which is a combination we use for this
     * functionality. This could be fixed by ditching `DocumentFragment`s,
     * or writing a patch for `TreeWalker`.
     * As per issue: http://stackoverflow.com/questions/21803827/chrome-28-treewalker-not-working-with-documentfragments
     */
    treeWalkerAndDocumentFragments: browserName === 'chrome' && contains(['26', '27', '28'], browserVersion),
  },

  firefox: {
    /**
     * As per browser inconsistency: http://jsbin.com/uvEdacoz/6/edit?js,output
     */
    insertHTMLNotMergingPElements: browserName === 'firefox'
  }
};

var local = ! process.env.TRAVIS;
if (process.env.RUN_IN_SAUCE_LABS) {
  local = false;
}

if (local) {
  var server;
  before(function () {
    // Note: you need to run from the root of the project
    // TODO: path.resolve
    server = new SeleniumServer('./vendor/selenium-server-standalone-2.41.0.jar', {
      port: 4444
    });

    return server.start();
  });
}

var driver;

before(function () {
  var serverAddress = local ? server.address() : 'http://ondemand.saucelabs.com:80/wd/hub';

  var capabilities = {
    browserName: browserName,
    version: browserVersion,
    platform: platform,
  };

  if (! local) {
    if (process.env.TRAVIS) {
      assign(capabilities, {
        name: [browserName, browserVersion].join(' '),
        build: process.env.TRAVIS_BUILD_NUMBER,
        tags: [process.env.TRAVIS_NODE_VERSION, 'CI'],
      });
    }

    assign(capabilities, {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    });
  }

  driver = new webdriver.Builder()
    .usingServer(serverAddress)
    .withCapabilities(capabilities)
    .build();

  driver.manage().timeouts().setScriptTimeout(20000);

  // Store the session ID so we can later notify Sauce Labs whether the suite
  // was passed or not.
  var getDriverSessionID;
  if (! local) {
    // TODO: don’t store the `sessionID` on `global` :-/
    getDriverSessionID = driver.getSession().then(function (session) {
      global.sessionID = session.getId();
    });
  }

  return Q.all([getDriverSessionID, driver.get('http://localhost:8080/test/app/index.html')]);
});

before(function () {
  chai.use(function (chai, utils) {
    chai.Assertion.addMethod('html', function (regExpContents) {
      var obj = utils.flag(this, 'object');
      new chai.Assertion(obj).to.match(getHtmlRegExp(regExpContents));
    });
  });

  function getHtmlRegExp(string) {
    string = string.replace('<bogus-br>', '<br>');

    var fragments;
    if (browserName === 'chrome') {
      fragments = string
        .replace(/<firefox-bogus-br>/g, '')
        .split('<chrome-bogus-br>')
        .map(encodeRegExp)
        .join('<br>');
    } else if (browserName === 'firefox') {
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

after(function () {
  // FIXME: Quit fails when there was an error from the WebDriver
  return driver.quit().then(function () {
    if (local) {
      return server.stop();
    }
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
            marker.classList.add('caret-position');
            range.insertNode(marker);
          }).then(function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p><em class="caret-position"></em>1</p>');
            });
          });
        });
      });
    });
  });
});

// TODO: These should be unit tests of the formatter functions, not
// integration tests.
describe('formatters', function () {
  beforeEach(function () {
    return initializeScribe();
  });

  describe('plain text', function () {
    // TODO: Abstract plugin tests
    describe('escape HTML characters', function () {
      when('content of "&" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('&');
          });
        });

        it('should convert the "&" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&amp;</p>');
          });
        });
      });

      when('content of "<" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('<');
          });
        });

        it('should convert the "<" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&lt;</p>');
          });
        });
      });

      when('content of ">" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('>');
          });
        });

        it('should convert the ">" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&gt;</p>');
          });
        });
      });

      when('content of "\\"" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('"');
          });
        });

        /**
         * FIXME: Fails because `element.insertHTML = '<p>&quot;</p>'` unescapes
         * the HTML entity (for double and single quotes). This can be fixed by
         * replacing these tests with unit tests.
         */
        it.skip('should convert the "\\"" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&quot;</p>');
          });
        });
      });

      when('content of "\'" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('\'');
          });
        });

        /**
         * FIXME: Fails because `element.insertHTML = '<p>&#39;</p>'` unescapes
         * the HTML entity (for double and single quotes). This can be fixed by
         * replacing these tests with unit tests.
         */
        it.skip('should convert the "\'" character to the corresponding HTML entity', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&#39;</p>');
          });
        });
      });

      when('content of "<p>1</p>" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('<p>1</p>');
          });
        });

        /**
         * FIXME: "&", "<" and ">" are escaped natively when you set
         * `Element.innerHTML`. Thus, those tests would pass with or without
         * the formatter. This test brings everything together to make sure
         * it really works.
         *
         * This could be fixed by having unit tests.
         */
        it('should convert HTML characters to their corresponding HTML entities', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>&lt;p&gt;1&lt;/p&gt;</p>');
          });
        });
      });
    });

    describe('convert new lines to HTML', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['plugins/formatters/plain-text/scribe-plugin-formatter-plain-text-convert-new-lines-to-html'], function (convertNewLinesToHtmlFormatter) {
            window.scribe.use(convertNewLinesToHtmlFormatter());
            done();
          });
        });
      });

      when('content of "1\\n2" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('1\n2');
          });
        });

        it('should replace the new line character with a BR element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1<br>2</p>');
          });
        });
      });

      when('content of "1\\n\\n2" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertPlainText('1\n\n2');
          });
        });

        it('should replace the new line characters with a closing P tag and an opening P tag', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p><p>2</p>');
          });
        });
      });
    });
  });

  describe('HTML', function () {
    describe('replace non-breaking space characters', function () {
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
              expect(innerHTML).to.have.html('<p>1 2<chrome-bogus-br></p>');
            });
          });
        });
      });
    });

    describe('setting the content', function() {
      when('the sanitizer plugin is enabled', function () {
        beforeEach(function () {
          return driver.executeAsyncScript(function (done) {
            require(['scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
              window.scribe.use(scribePluginSanitizer({ tags: { p: {} } }));
              done();
            });
          });
        });

        // Integration tests to ensure the formatters apply the correct
        // transformation when the content is set.
        givenContentOf('<h1>1</h1>', function () {
          it('should not modify the HTML', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p>');
            });
          });
        });

        // Integration tests to ensure the formatters apply the correct
        // transformation when the content is set.
        // TODO: This should be a unit test against the `enforcePElements`
        // formatter.
        // TODO: Allow `enforcePElements` formatter to have configurable
        // definition of block elements.
        givenContentOf('<foo></foo><h1>1</h1>', function () {
          it('should not modify the HTML', function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.have.html('<p>1</p>');
            });
          });
        });
      });

      // Integration tests to ensure the formatters do not incorrectly alter
      // the content when set.
      givenContentOf('<h1>1</h1>', function () {
        it('should not modify the HTML', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<h1>1</h1>');
          });
        });
      });
    });

    // This isn’t a unit test for the sanitizer plugin, but rather an
    // integration test to check the formatter phases happen in the correct
    // order.
    describe('normalization phase', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: {
                p: {}
              }
            }));
            done();
          });
        });
      });

      when('content of "<meta><h1>1</h1>" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertHTML('<meta><h1>1</h1>');
          });
        });

        it('should strip non-whitelisted elements and then any text nodes in a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p>');
          });
        });
      });
    });

    describe('trim whitespace', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: {
                p: {}
              }
            }));
            done();
          });
        });
      });

      when('content of "<p>1</p>\n<p>2</p>" is inserted', function () {
        beforeEach(function () {
          // Focus it before-hand
          scribeNode.click();

          return driver.executeScript(function () {
            window.scribe.insertHTML('<p>1</p>\n<p>2</p>');
          });
        });

        it.skip('should strip the whitespace in-between the P elements and remove the HTML comment', function () {
          // Chrome and Firefox: '<p>1</p><p>\n</p><p>2</p>'
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p> <p>2</p>');
          });
        });
      });
    });
  });
});

describe('block mode', function () {
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
          return scribeNode.sendKeys(webdriver.Key.RETURN);
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

  describe('blockquotes', function () {
    beforeEach(function () {
      return driver.executeAsyncScript(function (done) {
        require(['plugins/scribe-plugin-blockquote-command'], function (blockquoteCommand) {
          window.scribe.use(blockquoteCommand());
          done();
        });
      });
    });

    // The BR node denotes where the user will type.
    givenContentOf('<blockquote><p>|<br></p></blockquote>', function () {
      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should delete the blockquote and insert an empty P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
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
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should delete the list and insert an empty P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><bogus-br></p>');
          });
        });
      });
    });

    givenContentOf('<ul><li><em>|</em><br></li></ul>', function () {
      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should delete the list and insert an empty P element whilst retaining any empty inline elements', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should split the list into two and insert an empty P element in-between', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
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

/* Temporarily broken due to refactoring of <p> cleanup,
 * plugin needs to be fixed and tests re-enabled
 */
describe.skip('smart lists plugin', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['plugins/scribe-plugin-smart-lists'], function (smartLists) {
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

describe('curly quotes plugin', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      require(['plugins/scribe-plugin-curly-quotes'], function (curlyQuotes) {
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
        // FIXME:
        if (seleniumBugs.firefox.curlyQuotes) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '<p>“””<br></p>'
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
        // FIXME:
        if (seleniumBugs.firefox.curlyQuotes) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '<p>Hello”””<br></p>'
          expect(innerHTML).to.have.html('<p>Hello”<firefox-bogus-br></p>');
        });
      });
    });
  });


  given('the caret is after a dot', function () {
    beforeEach(function () {
      return scribeNode.sendKeys('“Hello.');
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('"');
      });

      it('should insert a closing curly double quote instead', function () {
        // FIXME:
        if (seleniumBugs.chrome.specialCharacters) { return; }
        // FIXME:
        if (seleniumBugs.firefox.curlyQuotes) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Chrome (30): '<p>Hello.”</p>'
          // Firefox (23, 24, 25): '<p>“Hello.”””<br></p>'
          expect(innerHTML).to.have.html('<p>“Hello.”<firefox-bogus-br></p>');
        });
      });
    });
  });

  given('the caret is after an opening parenthesis', function () {
    beforeEach(function () {
      return scribeNode.sendKeys('(');
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        return scribeNode.sendKeys('"');
      });

      it('should insert an opening curly double quote', function () {
        // FIXME:
        if (seleniumBugs.chrome.specialCharacters) { return; }
        // FIXME:
        if (seleniumBugs.firefox.curlyQuotes) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Chrome (30): '<p>Hello.”</p>'
          // Firefox (23, 24, 25): '<p>“Hello.”””<br></p>'
          expect(innerHTML).to.have.html('<p>(“<firefox-bogus-br></p>');
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

      it('should insert an opening curly double quote instead', function () {
        /**
         * FIXME: Fails in Chrome.
         * Disabled as Chrome inserts a bogus &nbsp; - this
         * might be a bug we want to fix though!
         */
        if (browserName === 'chrome') { return; }
        // FIXME:
        if (seleniumBugs.firefox.curlyQuotes) { return; }

        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Firefox (23, 24, 25): '<p>Hello “””<br></p>'
          expect(innerHTML).to.have.html('<p>Hello “<firefox-bogus-br></p>');
        });
      });
    });

  });


  given('default content', function () {
    beforeEach(function () {
      // Focus it before-hand
      scribeNode.click();
    });

    /* Single quotes */

    when('inserting single quotes around a word', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML("<p>Hello 'world'!</p>");
        });
      });

      it('should replace with curly single quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello ‘world’!</p>');
        });
      });
    });

    when('inserting single quotes after punctuation', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML("<p>'Hello world!'</p>");
        });
      });

      it('should replace with curly single quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>‘Hello world!’</p>');
        });
      });
    });

    when('inserting single quotes after closing elements', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          // Misplaced inline elements wrt whitespace, but can happen
          window.scribe.insertHTML("<p>'<em>Hello world!</em>' <strong>And </strong>'other'<strong> example</strong></p>");
        });
      });

      it('should replace with curly single quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>‘<em>Hello world!</em>’ <strong>And </strong>‘other’<strong> example</strong></p>');
        });
      });
    });

    when('inserting single quotes between elements and newlines', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML("<p>1\n'<em>2</em>'\n3</p>");
        });
      });

      it('should replace with curly single quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal("<p>1\n‘<em>2</em>’\n3</p>");
        });
      });
    });

    when('inserting single quotes in between closing elements', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          // Misplaced inline elements wrt whitespace, but can happen
          window.scribe.insertHTML("<p>'<em>Hello world!</em>'</p>");
        });
      });

      // Fails due to simplistic heuristic, but we assume it's not
      // going to happen much, and can be fixed manually in the worst
      // case
      it.skip('should replace with curly single quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>‘<em>Hello world!</em>’</p>');
        });
      });
    });

    when('inserting content with single quoted attributes', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML("<p><em class='foo'>Just text</em></p>");
        });
      });

      it('should not convert them to curly quotes', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          // Note that the attribute quotes got changed to double quotes; no biggie though
          expect(innerHTML).to.equal('<p><em class="foo">Just text</em></p>');
        });
      });
    });

    when('inserting escaped HTML with single quoted attributes', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML("<p>&lt;p class='foo'&gt;1&lt;/p&gt;</p>");
        });
      });

      it('should not convert them to curly quotes', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal("<p>&lt;p class='foo'&gt;1&lt;/p&gt;</p>");
        });
      });
    });


    /* Double quotes */

    when('inserting double quotes around a word', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>Hello "world"!</p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello “world”!</p>');
        });
      });
    });

    when('inserting double quotes after punctuation', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>"Hello world!"</p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>“Hello world!”</p>');
        });
      });
    });


    when('inserting double quotes inside parentheses', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>("1")</p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>(“1”)</p>');
        });
      });
    });

    when('inserting double quotes after closing elements', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          // Misplaced inline elements wrt whitespace, but can happen
          window.scribe.insertHTML('<p>"<em>Hello world!</em>" <strong>And </strong>"other"<strong> example</strong></p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>“<em>Hello world!</em>” <strong>And </strong>“other”<strong> example</strong></p>');
        });
      });
    });

    when('inserting double quotes between elements and newlines', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>1\n"<em>2</em>"\n3</p>');
        });
      });

      it('should replace with curly double quotes instead', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>1\n“<em>2</em>”\n3</p>');
        });
      });
    });

    when('inserting content with double quoted attributes', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p><em class="foo">Just text</em></p>');
        });
      });

      it('should not convert them to curly quotes', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p><em class="foo">Just text</em></p>');
        });
      });
    });

    // TODO: We could use insertPlainText, or better, rewrite much of
    // this as a unit test where that would not be a concern
    when('inserting escaped HTML with double quoted attributes', function () {
      beforeEach(function () {
        return driver.executeScript(function () {
          window.scribe.insertHTML('<p>&lt;p class="foo"&gt;1&lt;/p&gt;</p>');
        });
      });

      it('should not convert them to curly quotes', function () {
        return scribeNode.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>&lt;p class="foo"&gt;1&lt;/p&gt;</p>');
        });
      });
    });
  });

});


describe('toolbar plugin', function () {

  beforeEach(function () {
    return initializeScribe();
  });

  beforeEach(function () {
    return driver.executeAsyncScript(function (done) {
      var body = document.querySelector('body');
      // Create toolbar
      var toolbarDiv = document.createElement('div');
      toolbarDiv.className = 'scribe-toolbarDiv';

      // Create one default button
      var defaultButton = document.createElement('button');
      defaultButton.setAttribute('data-command-name', 'removeFormat');
      defaultButton.innerText = 'Remove Format';

      // Create a vendor button
      var vendorButton = document.createElement('button');
      vendorButton.innerText = 'Leave vendor alone!';

      // Add them to the DOM
      toolbarDiv.appendChild(defaultButton);
      toolbarDiv.appendChild(vendorButton);
      body.appendChild(toolbarDiv);

      require(['plugins/scribe-plugin-toolbar'], function (toolbarPlugin) {
        window.scribe.use(toolbarPlugin(toolbarDiv));
        done();
      });
    });
  });

  when('updating the toolbar ui', function () {
    beforeEach(function () {
      // Click in the contenteditable to enable/disable relevant buttons
      return scribeNode.click();
    });

    it('should not disable vendor buttons', function () {
      return driver.executeScript(function () {
        var vendorButtons = document.querySelectorAll('.scribe-toolbar button');
        Array.prototype.forEach.call(vendorButtons, function(button) {
          if (button.hasAttribute('data-command-name')) {
            // We have a default button, which is disabled when no text is
            // inserted
            expect(button.disabled).to.be.ok;
          } else {
            // We have a vendor button, it shouldn't be disabled
            expect(button.disabled).to.not.be.ok;
          }
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
    var command = window.scribe.getCommand(commandName);
    command.execute(value);
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
