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

given('an editor with the curly quotes plugin', function () {

  when('at the beginning of a line', function () {
    when('the user types ascii double quote', function () {
      beforeEach(function () {
        editor.sendKeys('"');
      });

      it('should insert an opening curly double quote instead', function (done) {
        editor.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>“<br></p>');
          done();
        });
      });
    });
  });

  when('at the end of a word', function () {
    beforeEach(function () {
      editor.sendKeys('Hello');
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        editor.sendKeys('"');
      });

      it('should insert a closing curly double quote instead', function (done) {
        editor.getInnerHTML().then(function (innerHTML) {
          expect(innerHTML).to.equal('<p>Hello”</p>');
          done();
        });
      });
    });
  });

  when('after the end of a word', function () {
    beforeEach(function () {
      editor.sendKeys('Hello '); // Note the space!
    });

    when('the user types ascii double quote', function () {
      beforeEach(function () {
        editor.sendKeys('"');
      });

      it('should insert an opening curly double quote instead', function (done) {
        editor.getInnerHTML().then(function (innerHTML) {
          // FIXME: failing, inserts nbsp!
          expect(innerHTML).to.equal('<p>Hello “</p>');
          done();
        });
      });
    });
  });
});
