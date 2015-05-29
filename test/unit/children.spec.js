require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../bower_components/lodash-amd',
    'immutable': '../../bower_components/immutable'
  }
});

var children = require('../../src/api/children');

var chai = require('chai');
var expect = chai.expect;

describe('children API', function() {
  it('should return the root node for node with no children', function() {
    expect(children.firstDeepestChild).to.be.a('function');
  });
});
