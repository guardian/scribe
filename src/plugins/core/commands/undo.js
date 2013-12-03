define([
  '../../../api/command'
], function (
  Command
) {

  'use strict';

  return function () {
    return function (scribe) {
      var undoCommand = new Command(scribe, 'undo');

      undoCommand.execute = function () {
        var historyItem = scribe.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position > 0;
      };

      scribe.patchedCommands.undo = undoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        if (! event.shiftKey && event.metaKey && event.keyCode === 90) {
          event.preventDefault();
          undoCommand.execute();
        }
      });
    };
  };

});
