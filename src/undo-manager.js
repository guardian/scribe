define([
  'immutable/dist/immutable'
], function (Immutable) {
  'use strict';

  function UndoManager(limit, undoScopeHost) {
    this._stack = Immutable.List();
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

    if (!!this.position) {
      this._stack = this._stack.skip(this.position);
      this.length = this._stack.size;
      this.position = 0;
    }

    if (merge && !!this.length) {
      this._stack = this._stack
        .skip(1)
        .unshift(this._stack.first().push(transaction));
    }
    else {
      this._stack = this._stack.unshift(Immutable.List.of(transaction));

      if (!!this._limit && this.size > this._limit) {
        this._stack = this._stack.take(this._limit);
      }

      this.length = this._stack.size;
    }

    if (this._fireEvent) {
      this._ush.dispatchEvent(new CustomEvent('DOMTransaction', {detail: {transactions: this._stack.first().toArray()}, bubbles: true, cancelable: false}));
    }
  };

  UndoManager.prototype.undo = function () {
    if (this.position === this.length) return;

    var transactions = this._stack.get(this.position);
    for (var i = transactions.size - 1; i >= 0; i--) {
      transactions.get(i).undo();
    }
    this.position++;

    if (this._fireEvent) {
      this._ush.dispatchEvent(new CustomEvent('undo', {detail: {transactions: transactions.toArray()}, bubbles: true, cancelable: false}));
    }
  };

  UndoManager.prototype.redo = function () {
    if (this.position === 0) return;

    var transactions = this._stack.get(this.position - 1);
    for (var i = 0, n = transactions.size; i < n; i++) {
      transactions.get(i).redo();
    }
    this.position--;

    if (this._fireEvent) {
      this._ush.dispatchEvent(new CustomEvent('redo', {detail: {transactions: transactions.toArray()}, bubbles: true, cancelable: false}));
    }
  };

  UndoManager.prototype.item = function (index) {
    return index >= 0 && index < this.length ?
      this._stack.get(index).toArray():
      null;
  };

  UndoManager.prototype.clearUndo = function () {
    this._stack = this._stack.take(this.position);
    this.length = this.position;
  };

  UndoManager.prototype.clearRedo = function () {
    this._stack = this._stack.skip(this.position);
    this.length = this._stack.size;
    this.position = 0;
  };

  return UndoManager;
});
