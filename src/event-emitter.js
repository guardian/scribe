define(['lodash-amd/modern/arrays/pull', 'immutable/dist/immutable'], function (pull, Immutable) {

  'use strict';

  // TODO: once
  // TODO: unit test
  // Good example of a complete(?) implementation: https://github.com/Wolfy87/EventEmitter
  function EventEmitter() {
    this._listeners = {};
  }

  EventEmitter.prototype.on = function (eventName, fn) {
    var listeners = (this._listeners[eventName] || new Immutable.Set());
    this._listeners[eventName] = listeners.add(fn);
  };

  EventEmitter.prototype.off = function (eventName, fn) {
    this._listeners[eventName] = (this._listeners[eventName] || new Immutable.Set());
    if (fn) {
      this._listeners = this._listeners.delete(fn);
    } else {
      delete this._listeners[eventName];
    }
  };

  EventEmitter.prototype.trigger = function (eventName, args) {
    var listeners = (this._listeners[eventName] || new Immutable.Set());

    listeners.forEach(function (listener) {
      listener.apply(null, args);
    });
  };

  return EventEmitter;

});
