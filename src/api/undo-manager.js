define([
  '../api',
  './selection'
], function (
  api
) {

  'use strict';

  api.UndoManager = function () {
    this.position = 0;

    this.stack = [];
  };

  api.UndoManager.prototype.push = function (item) {
    this.stack.length = ++this.position;
    this.stack.push(item);
  };

  api.UndoManager.prototype.undo = function () {
    if (this.position > 0) {
      return this.stack[--this.position];
    }
  };

  api.UndoManager.prototype.redo = function () {
    if (this.position < this.stack.length - 1) {
      return this.stack[++this.position];
    }
  };

  return api;

});
