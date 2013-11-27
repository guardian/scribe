define([
  '../../../api/command'
], function (
  Command
) {

  'use strict';

  return function () {
    return function (editor) {
      var redoCommand = new Command(editor, 'redo');

      redoCommand.execute = function () {
        var historyItem = editor.undoManager.redo();

        if (typeof historyItem !== 'undefined') {
          editor.restoreFromHistory(historyItem);
        }
      };

      redoCommand.queryEnabled = function () {
        return editor.undoManager.position < editor.undoManager.stack.length - 1;
      };

      editor.patchedCommands.redo = redoCommand;

      editor.el.addEventListener('keydown', function (event) {
        if (event.shiftKey && event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          redoCommand.execute();
        }
      });
    };
  };

});
