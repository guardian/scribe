var chai = require('chai');
var expect = chai.expect;

var helpers = require('scribe-test-harness/helpers');
helpers.registerChai(chai);
var when = helpers.when;
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

      require(['../../bower_components/scribe-plugin-toolbar/src/scribe-plugin-toolbar'], function (toolbarPlugin) {
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
