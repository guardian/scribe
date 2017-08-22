var chai = require('chai');
var webdriver = require('selenium-webdriver');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var given = helpers.given;
var givenContentOf = helpers.givenContentOf;
var initializeScribe = helpers.initializeScribe.bind(null, '../../src/scribe');

// Get new referenceS each time a new instance is created
var driver;
before(function () {
  driver = helpers.driver;
});

var scribeNode;
beforeEach(function () {
  scribeNode = helpers.scribeNode;
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
        require(['../../node_modules/scribe-plugin-blockquote-command/src/scribe-plugin-blockquote-command'], function (blockquoteCommand) {
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

    givenContentOf('<ul><li><em>|<br></em></li></ul>', function () {
      when('the user presses <enter>', function () {
        beforeEach(function () {
          return scribeNode.sendKeys(webdriver.Key.RETURN);
        });

        it('should delete the list and insert an empty P element whilst retaining any empty inline elements', function () {
          return scribeNode.getInnerHTML().then(function (innerHTML) {
            expect(innerHTML).to.have.html('<p><em><bogus-br></em></p>');
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
