define([
  './selection'
], function () {

  'use strict';

  function UndoManager() {
    this.position = 0;

    this.stack = [];
  }

  UndoManager.prototype.push = function (item) {
    console.log('UndoManager.push: %s', item);
    this.stack.length = ++this.position;
    this.stack.push(item);
  };

  UndoManager.prototype.undo = function () {
    if (this.position > 1) {
      return this.stack[--this.position];
    }
  };

  UndoManager.prototype.redo = function () {
    if (this.position < this.stack.length - 1) {
      return this.stack[++this.position];
    }
  };

  return UndoManager;

});
