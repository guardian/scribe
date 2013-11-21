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
        var historyItem = editor.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          editor.restoreFromHistory(historyItem);
        }
      };

      var redoCommand = new api.CommandPatch('redo');

      redoCommand.execute = function () {
        var historyItem = editor.undoManager.redo();

        if (typeof historyItem !== 'undefined') {
          editor.restoreFromHistory(historyItem);
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
    };
  };

});
