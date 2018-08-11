require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../node_modules/lodash-amd',
    'immutable': '../../node_modules/immutable'
  }
});

var nodeHelpers = require('../../src/node');

var chai = require('chai');

var assert = chai.assert;

var MockBrowser = require('mock-browser').mocks.MockBrowser;
var fakeBrowser = new MockBrowser();
var doc = fakeBrowser.getDocument();

var FakeNode = {
  ELEMENT_NODE: 1
};

describe('Node type checking', function() {
  describe('nodes with a particular class', function() {
    it('provides a checking function', function() {
      var checkFunction = nodeHelpers.elementHasClass(FakeNode, 'test');
      assert.isFunction(checkFunction);
    });

    it('checks that a particular class is present', function() {
      var checkFunction = nodeHelpers.elementHasClass(FakeNode, 'test');
      var fakeElement = doc.createElement('div');
      fakeElement.className = 'test';

      assert.isTrue(checkFunction(fakeElement));
    });

    it('checks that a particular class is not present', function() {
      var checkFunction = nodeHelpers.elementHasClass(FakeNode, 'test');
      var fakeElement = doc.createElement('div');

      assert.isFalse(checkFunction(fakeElement));

      fakeElement.className = 'fake-name';

      assert.isFalse(checkFunction(fakeElement));
    });
  });
});
