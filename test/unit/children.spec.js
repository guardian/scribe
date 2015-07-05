require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../bower_components/lodash-amd',
    'immutable': '../../bower_components/immutable'
  }
});

var children = require('../../src/node');

var chai = require('chai');
var expect = chai.expect;

describe('children API', function() {
  it('should return the root node for node with no children', function() {
    var fakeNode = {hasChildNodes: function() { return false; }};
    expect(children.firstDeepestChild(fakeNode)).to.equal(fakeNode);
  });
});
