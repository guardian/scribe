/**
 * IMPORTANT: FIXME: These tests are referring to the source of plugins at their
 * master branch, so if you’re checking this out from the future, it’s probably
 * not going to run the tests.
 */

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

/* global describe, after, afterEach, before, beforeEach */

exports.given = function () {
  var args = Object.create(arguments);
  args[0] = 'given ' + args[0];
  describe.apply(null, args);
};

exports.when = function () {
  var args = Object.create(arguments);
  args[0] = 'when ' + args[0];
  describe.apply(null, args);
};

exports.initializeScribe = function (options) {
  return exports.driver.executeAsyncScript(setupTest, options).then(function () {
    exports.scribeNode.getInnerHTML = function () {
      return exports.driver.executeScript(function () {
        return window.scribe.getHTML();
      });
    };
  });

  function setupTest(options, done) {
    require(['../../src/scribe'], function (Scribe) {
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
};

function setContent(html) {
  return exports.driver.executeScript(function (html) {
    window.scribe.setContent(html.replace(/\|/g, '<em class="scribe-marker"></em>'));
  }, html);
}

exports.executeCommand = function (commandName, value) {
  return exports.driver.executeScript(function (commandName, value) {
    var command = window.scribe.getCommand(commandName);
    command.execute(value);
  }, commandName, value);
};

exports.givenContentOf = function (content, fn) {
  exports.given('content of "' + content + '"', function () {
    beforeEach(function () {
      return setContent(content).then(function () {
        return exports.driver.executeScript(function (content) {
          if (content.match('|').length) {
            var selection = new window.scribe.api.Selection();
            selection.selectMarkers();
          }
        }, content);
      }).then(function () {
        // Focus the editor now that the selection has been applied
        return exports.driver.executeScript(function () {
          window.scribe.el.focus();
        });
      });
    });

    fn();
  });
};

// DOM helper
exports.insertCaretPositionMarker = function () {
  // Insert a marker so we can see where the caret is
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  var marker = document.createElement('em');
  marker.classList.add('caret-position');
  range.insertNode(marker);
};

exports.browserName = process.env.BROWSER_NAME;
exports.browserVersion = process.env.BROWSER_VERSION;
exports.platform = process.env.PLATFORM;

if (! exports.browserName) {
  throw new Error('The BROWSER_NAME environment variable must not be empty.');
}

/**
 * These are issues against Selenium that we currently bypass in order to
 * achieve a green build. If you perform the actions manually, they are fine.
 */
exports.seleniumBugs = {
  chrome: {
    /**
     * Chrome (30) does not properly send • or “ keys
     * As per issue: https://code.google.com/p/selenium/issues/detail?id=6998
     */
    specialCharacters: exports.browserName === 'chrome' && exports.browserVersion === '30'
  },
  firefox: {
    /**
     * In Firefox 23, 24, and 25, Selenium’s "RETURN" key is somehow different
     * to the manual event. My hypothesis is that it is sent twice.
     */
    inlineElementsMode: exports.browserName === 'firefox' && contains(['23', '24', '25'], exports.browserVersion),
    /**
     * In Firefox 23, 24, and 25, Selenium’s "\"" key is somehow different to
     * the manual event — *only when the curly quotes plugin is enabled.*
     * My hypothesis is that it is sent thrice.
     */
    curlyQuotes: exports.browserName === 'firefox' && contains(['21', '23', '24', '25', '26'], exports.browserVersion)
  }
};

/**
 * These are issues against browsers that we currently bypass in order to
 * achieve a green build — because the problem is not worth fixing.
 */
exports.browserBugs = {
  chrome: {
    /**
     * In Chrome <= 28, `TreeWalker` does not work properly with
     * `DocumentFragment`s, which is a combination we use for this
     * functionality. This could be fixed by ditching `DocumentFragment`s,
     * or writing a patch for `TreeWalker`.
     * As per issue: http://stackoverflow.com/questions/21803827/chrome-28-treewalker-not-working-with-documentfragments
     */
    treeWalkerAndDocumentFragments: exports.browserName === 'chrome' && contains(['26', '27', '28'], exports.browserVersion),
  },

  firefox: {
    /**
     * As per browser inconsistency: http://jsbin.com/uvEdacoz/6/edit?js,output
     */
    insertHTMLNotMergingPElements: exports.browserName === 'firefox'
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

before(function () {
  var serverAddress = local ? server.address() : 'http://ondemand.saucelabs.com:80/wd/hub';

  var capabilities = {
    browserName: exports.browserName,
    version: exports.browserVersion,
    platform: exports.platform,
  };

  if (! local) {
    if (process.env.TRAVIS) {
      assign(capabilities, {
        name: [exports.browserName, exports.browserVersion].join(' '),
        build: process.env.TRAVIS_BUILD_NUMBER,
        tags: [process.env.TRAVIS_NODE_VERSION, 'CI'],
      });
    }

    assign(capabilities, {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      // Additional Sauce Labs config:
      // https://saucelabs.com/docs/additional-config
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      'video-upload-on-pass': false
    });
  }

  exports.driver = new webdriver.Builder()
    .usingServer(serverAddress)
    .withCapabilities(capabilities)
    .build();

  exports.driver.manage().timeouts().setScriptTimeout(20000);

  // Store the session ID so we can later notify Sauce Labs whether the suite
  // was passed or not.
  var getDriverSessionID;
  if (! local) {
    // TODO: don’t store the `sessionID` on `global` :-/
    getDriverSessionID = exports.driver.getSession().then(function (session) {
      global.sessionID = session.getId();
    });
  }

  return Q.all([getDriverSessionID, exports.driver.get('http://localhost:8080/test/app/index.html')]);
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
    if (exports.browserName === 'chrome') {
      fragments = string
        .replace(/<firefox-bogus-br>/g, '')
        .split('<chrome-bogus-br>')
        .map(encodeRegExp)
        .join('<br>');
    } else if (exports.browserName === 'firefox') {
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
  return exports.driver.quit().then(function () {
    if (local) {
      return server.stop();
    }
  });
});

beforeEach(function () {
  return exports.driver.wait(function () {
    return exports.driver.executeScript('return document.readyState').then(function (returnValue) {
      return returnValue === 'complete';
    });
  });
});

afterEach(function () {
  return exports.driver.navigate().refresh();
});

beforeEach(function () {
  exports.scribeNode = exports.driver.findElement(webdriver.By.className('scribe'));
});
