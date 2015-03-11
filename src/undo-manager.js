define(function () {
  'use strict';

  function UndoManager(limit, undoScopeHost) {
    this._stack = [];
    this._limit = limit;
    this._fireEvent = typeof CustomEvent != 'undefined' && undoScopeHost && undoScopeHost.dispatchEvent;
    this._ush = undoScopeHost;

    this.position = 0;
    this.length = 0;
  }

  UndoManager.prototype.transact = function (transaction, merge) {
    if (arguments.length < 2) {
      throw new TypeError('Not enough arguments to UndoManager.transact.');
    }

    transaction.execute();

    this._stack.splice(0, this.position);
    if (merge && this.length) {
      this._stack[0].push(transaction);
    }
    else {
      this._stack.unshift([transaction]);
    }
    this.position = 0;

    if (this._limit && this._stack.length > this._limit) {
      this.length = this._stack.length = this._limit;
    }
    else {
      this.length = this._stack.length;
    }

    if (this._fireEvent) {
      this._ush.dispatchEvent(new CustomEvent('DOMTransaction', {detail: {transactions: this._stack[0].slice()}, bubbles: true, cancelable: false}));
    }
  };

  UndoManager.prototype.undo = function () {
    if (this.position < this.length) {
      for (var i = this._stack[this.position].length - 1; i >= 0; i--) {
        this._stack[this.position][i].undo();
      }
      this.position++;

      if (this._fireEvent) {
        this._ush.dispatchEvent(new CustomEvent('undo', {detail: {transactions: this._stack[this.position - 1].slice()}, bubbles: true, cancelable: false}));
      }
    }
  };

  UndoManager.prototype.redo = function () {
    if (this.position > 0) {
      for (var i = 0, n = this._stack[this.position - 1].length; i < n; i++) {
        this._stack[this.position - 1][i].redo();
      }
      this.position--;

      if (this._fireEvent) {
        this._ush.dispatchEvent(new CustomEvent('redo', {detail: {transactions: this._stack[this.position].slice()}, bubbles: true, cancelable: false}));
      }
    }
  };

  UndoManager.prototype.item = function (index) {
    if (index >= 0 && index < this.length) {
      return this._stack[index].slice();
    }
    return null;
  };

  UndoManager.prototype.clearUndo = function () {
    this._stack.length = this.length = this.position;
  };

  UndoManager.prototype.clearRedo = function () {
    this._stack.splice(0, this.position);
    this.position = 0;
    this.length = this._stack.length;
  };

  return UndoManager;
});

