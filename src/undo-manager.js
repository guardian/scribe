define(function () {
	'use strict';

	function UndoManager(limit, undoScopeHost) {
		var stack = [];
		var fireEvent = typeof CustomEvent != 'undefined' && undoScopeHost && undoScopeHost.dispatchEvent;

		this.position = 0;
		this.length = 0;

		this.transact = function (transaction, merge) {
			if (arguments.length < 2) {
				throw new TypeError('Not enough arguments to UndoManager.transact.');
			}

			transaction.execute();

			stack.splice(0, this.position);
			if (merge && this.length) {
				stack[0].push(transaction);
			}
			else {
				stack.unshift([transaction]);
			}
			this.position = 0;

			if (limit && stack.length > limit) {
				this.length = stack.length = limit;
			}
			else {
				this.length = stack.length;
			}

			if (fireEvent) {
				undoScopeHost.dispatchEvent(new CustomEvent('DOMTransaction', {detail: {transactions: stack[0].slice()}, bubbles: true, cancelable: false}));
			}
		};

		this.undo = function () {
			if (this.position < this.length) {
				for (var i = stack[this.position].length - 1; i >= 0; i--) {
					stack[this.position][i].undo();
				}
				this.position++;

				if (fireEvent) {
					undoScopeHost.dispatchEvent(new CustomEvent('undo', {detail: {transactions: stack[this.position - 1].slice()}, bubbles: true, cancelable: false}));
				}
			}
		};

		this.redo = function () {
			if (this.position > 0) {
				for (var i = 0, n = stack[this.position - 1].length; i < n; i++) {
					stack[this.position - 1][i].redo();
				}
				this.position--;

				if (fireEvent) {
					undoScopeHost.dispatchEvent(new CustomEvent('redo', {detail: {transactions: stack[this.position].slice()}, bubbles: true, cancelable: false}));
				}
			}
		};

		this.item = function (index) {
			if (index >= 0 && index < this.length) {
				return stack[index].slice();
			}
			return null;
		};

		this.clearUndo = function () {
			stack.length = this.length = this.position;
		};

		this.clearRedo = function () {
			stack.splice(0, this.position);
			this.position = 0;
			this.length = stack.length;
		};
	}

	return UndoManager;
});
