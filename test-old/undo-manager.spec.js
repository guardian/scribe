var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
var givenContentOf = helpers.givenContentOf;
var executeCommand = helpers.executeCommand;
var insertCaretPositionMarker = helpers.insertCaretPositionMarker;
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

describe('undo manager', function () {
  beforeEach(function () {
    return initializeScribe();
  });
  
  // Undo manager merge interval set to 0ms (default is 1000ms).
  // This will avoid merging instant typing transactions as performed by these automated tests.
  beforeEach(function () {
    return driver.executeScript(function () {
      window.scribe.options.undo.interval = 0;
    });
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
          // TODO: Find a better way to expect a selection
          return driver.executeScript(insertCaretPositionMarker).then(function () {
            return scribeNode.getInnerHTML().then(function (innerHTML) {
              expect(innerHTML).to.equal('<p><em class="caret-position"><br></em>1</p>');
            });
          });
        });

        when('the redo command is executed', function () {
          beforeEach(function () {
            return executeCommand('redo');
          });

          it('should restore the caret and the content', function () {
            // TODO: Find a better way to expect a selection
            return driver.executeScript(insertCaretPositionMarker).then(function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<p>2<em class="caret-position"><br></em>1</p>');
              });
            });
          });
        });
      });

      when('the user types again', function () {
        beforeEach(function () {
          return scribeNode.sendKeys('3');
        });

        when('the undo command is executed', function () {
          beforeEach(function () {
            return executeCommand('undo');
          });

          it('should restore the caret and the content', function () {
            // TODO: Find a better way to expect a selection
            return driver.executeScript(insertCaretPositionMarker).then(function () {
              return scribeNode.getInnerHTML().then(function (innerHTML) {
                expect(innerHTML).to.equal('<p>2<em class="caret-position"><br></em>1</p>');
              });
            });
          });

          when('the redo command is executed', function () {
            beforeEach(function () {
              return executeCommand('redo');
            });

            it('should restore the caret and the content', function () {
              // TODO: Find a better way to expect a selection
              return driver.executeScript(insertCaretPositionMarker).then(function () {
                return scribeNode.getInnerHTML().then(function (innerHTML) {
                  expect(innerHTML).to.equal('<p>23<em class="caret-position"><br></em>1</p>');
                });
              });
            });
          });
        });
      });
    });
  });
});
