define(function () {

  'use strict';

  return function () {
    return function (editable) {
      var undoManager = {
        position: 0,

        stack: [{
          value: 0,
          selectionStart: 0,
          selectionEnd: 0
        }],

        undo: function () {
          if (undoManager.position > 0) {
            restoreUndoItem(undoManager.stack[--undoManager.position]);
          }
        },

        redo: function () {
          if (undoManager.position < undoManager.stack.length - 1) {
            restoreUndoItem(undoManager.stack[++undoManager.position]);
          }
        }
      };

      editable.el.addEventListener('input', function () {
        var undoItem = {
          innerHTML: editable.el.innerHTML,
          // selectionStart: editable.el.selectionStart,
          // selectionEnd: editable.el.selectionEnd
        };
        undoManager.stack.length = ++undoManager.position;
        undoManager.stack.push(undoItem);
      }, false);

      editable.undoManager = undoManager;

      function restoreUndoItem(item) {
        editable.el.innerHTML = item.innerHTML;
        // editable.el.selectionStart = item.selectionStart;
        // editable.el.selectionEnd = item.selectionEnd;
      }
    };
  };

});
