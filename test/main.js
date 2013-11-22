var expect = require('chai').expect;
var webdriver = require('selenium-webdriver');
var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

var server = new SeleniumServer('/Users/Oliver/Downloads/selenium-server-standalone-2.35.0.jar', {
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

/* global it, after */

after(function (done) {
  driver.quit().then(function () {
    done();
  });
});

it('should insert the text inside of a P element', function (done) {
  editor.sendKeys('1');

  editor.getInnerHTML().then(function (innerHTML) {
    expect(innerHTML).to.equal('<p>1</p>');
    done();
  });
});
