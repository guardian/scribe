require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../node_modules/lodash-amd',
    'immutable': '../../node_modules/immutable'
  }
});

var Mutations = require('../../src/mutations');

var chai = require('chai');
var expect = chai.expect;

describe('Mutations', function() {
  describe('Mutation Observer', function() {
    describe('server-side', function() {
      it('should provide a stub', function() {
        var stubObserver = Mutations.determineMutationObserver(undefined);

        chai.assert.isFunction(stubObserver);
        chai.assert.isFunction(stubObserver().observe);
      });
    });

    describe('browser', function() {
      it("should use the window's MutationObserver if present", function() {
        var fakeObserver = function() {};
        var returnedObserver = Mutations.determineMutationObserver({MutationObserver: fakeObserver});

        chai.assert.strictEqual(fakeObserver, returnedObserver);
      });

    });
  });
});
