require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../bower_components/lodash-amd',
    'immutable': '../../bower_components/immutable'
  }
});

var chai = require('chai');
var sinon = require('sinon');
var EventEmitter = require('../../src/event-emitter');
var expect = chai.expect;

var emitter;
beforeEach(function(){
  emitter = new EventEmitter();
});

describe('event-emitter', function(){

  it('should fire events in order of namespace', function(){

    var firstHandle = sinon.spy();
    var secondHandle = sinon.spy();
    var thirdHandle = sinon.spy();

    emitter.on('my:custom:event', firstHandle);
    emitter.on('my:custom', secondHandle);
    emitter.on('my', thirdHandle);

    emitter.trigger('my:custom:event');

    expect(firstHandle.callCount).to.equal(1);
    expect(secondHandle.callCount).to.equal(1);
    expect(thirdHandle.callCount).to.equal(1);

    expect(firstHandle.calledBefore(secondHandle)).to.be.true;
    expect(secondHandle.calledBefore(thirdHandle)).to.be.true;

  });
});
