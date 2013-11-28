define([
  '../../../api/command'
], function (
  Command
) {

  'use strict';

  return function () {
    return function (editor) {
      var undoCommand = new Command(editor, 'undo');

      undoCommand.execute = function () {
        var historyItem = editor.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          editor.restoreFromHistory(historyItem);
        }
      };

      undoCommand.queryEnabled = function () {
        return editor.undoManager.position > 0;
      };

      editor.patchedCommands.undo = undoCommand;

      editor.el.addEventListener('keydown', function (event) {
        if (! event.shiftKey && event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          undoCommand.execute();
        }
      });
    };
  };

});
