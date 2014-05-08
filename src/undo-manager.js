define(function () {

  'use strict';

  return function (scribe) {

    function UndoManager() {
      this.position = -1;
      this.stack = [];
      this.debug = scribe.isDebugModeEnabled();
    }

    UndoManager.prototype.maxStackSize = 100;

    UndoManager.prototype.push = function (item) {
      if (this.debug) {
        console.log('UndoManager.push: %s', item);
      }
      this.stack.length = ++this.position;
      this.stack.push(item);

      while (this.stack.length > this.maxStackSize) {
        this.stack.shift();
        --this.position;
      }
    };

    UndoManager.prototype.undo = function () {
      if (this.position > 0) {
        return this.stack[--this.position];
      }
    };

    UndoManager.prototype.redo = function () {
      if (this.position < this.stack.length - 1) {
        return this.stack[++this.position];
      }
    };

    return UndoManager;
  };

});
