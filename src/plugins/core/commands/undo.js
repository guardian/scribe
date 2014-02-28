define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var undoCommand = new scribe.api.Command('undo');

      undoCommand.execute = function () {
        var historyItem = scribe.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position > 1;
      };

      scribe.commands.undo = undoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        // TODO: use lib to abstract meta/ctrl keys?
        if (! event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
          event.preventDefault();
          undoCommand.execute();
        }
      });
    };
  };

});
