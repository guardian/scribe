define([
  '../../../api',
  '../../../api/selection'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      editable.patchedCommands.undo = undoCommand;
      editable.patchedCommands.redo = redoCommand;

      editable.el.addEventListener('keydown', function (event) {
        if (event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          if (event.shiftKey) {
            editable.execCommand('redo');
          } else {
            editable.execCommand('undo');
          }
        }
      });

      function undoCommand() {
        restoreUndoItem(editable.undoManager.undo());
      }

      function redoCommand() {
        restoreUndoItem(editable.undoManager.redo());
      }

      function restoreUndoItem(item) {
        editable.el.innerHTML = item;

        // Restore the selection
        var selection = new api.Selection();
        selection.selectMarkers(editable.el);
      }
    };
  };

});
