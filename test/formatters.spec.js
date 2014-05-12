var chai = require('chai');
var expect = chai.expect;

var helpers = require('./helpers');
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var initializeScribe = helpers.initializeScribe;

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
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
          require(['../../bower_components/scribe-plugin-formatter-plain-text-convert-new-lines-to-html/src/scribe-plugin-formatter-plain-text-convert-new-lines-to-html'], function (convertNewLinesToHtmlFormatter) {
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
      // Integration tests to ensure the formatters do not incorrectly alter
      // the content when set.
      givenContentOf('<h1>1</h1>', function () {
        it('should not modify the HTML', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<h1>1</h1>');
          });
        });
      });

      when('the sanitizer plugin is enabled', function () {
        beforeEach(function () {
          return driver.executeAsyncScript(function (done) {
            require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
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
    });

    // This isn’t a unit test for the sanitizer plugin, but rather an
    // integration test to check the formatter phases happen in the correct
    // order.
    describe('normalization phase', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
            window.scribe.use(scribePluginSanitizer({
              tags: {
                p: {}
              }
            }));
            done();
          });
        });
      });

      when('content of "<foo><h1>1</h1>" is set', function () {
        beforeEach(function () {
          return driver.executeScript(function () {
            window.scribe.setContent('<foo><h1>1</h1>');
          });
        });

        it('should strip non-whitelisted elements and then wrap any text nodes in a P element', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p>1</p>');
          });
        });
      });
    });

    describe('trim whitespace', function () {
      beforeEach(function () {
        return driver.executeAsyncScript(function (done) {
          require(['../../bower_components/scribe-plugin-sanitizer/src/scribe-plugin-sanitizer'], function (scribePluginSanitizer) {
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
