define([
  '../../../api',
  '../../../api/selection'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      editor.patchedCommands.undo = undoCommand;
      editor.patchedCommands.redo = redoCommand;

      editor.el.addEventListener('keydown', function (event) {
        if (event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          if (event.shiftKey) {
            editor.execCommand('redo');
          } else {
            editor.execCommand('undo');
          }
        }
      });

      function undoCommand() {
        restoreUndoItem(editor.undoManager.undo());
      }

      function redoCommand() {
        restoreUndoItem(editor.undoManager.redo());
      }

      function restoreUndoItem(item) {
        editor.el.innerHTML = item;

        // Restore the selection
        var selection = new api.Selection();
        selection.selectMarkers(editor.el);
      }
    };
  };

});
