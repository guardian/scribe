define([
  '../../api',
  '../../api/command-patch',
  '../../api/selection'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      var undoCommand = new api.CommandPatch('undo');

      undoCommand.execute = function () {
        var undoItem = editor.undoManager.undo();

        if (typeof undoItem !== 'undefined') {
          restoreUndoItem(undoItem);
        }
      };

      var redoCommand = new api.CommandPatch('redo');

      redoCommand.execute = function () {
        var undoItem = editor.undoManager.redo();

        if (typeof undoItem !== 'undefined') {
          restoreUndoItem(undoItem);
        }
      };

      editor.patchedCommands.undo = undoCommand;
      editor.patchedCommands.redo = redoCommand;

      editor.el.addEventListener('keydown', function (event) {
        if (event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          var command = event.shiftKey ? redoCommand : undoCommand;
          command.execute();
        }
      });

      function restoreUndoItem(item) {
        editor.el.innerHTML = item;

        // Restore the selection
        var selection = new api.Selection();
        selection.selectMarkers(editor.el);
      }
    };
  };

});
