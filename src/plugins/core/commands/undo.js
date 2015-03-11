define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var undoCommand = new scribe.api.Command('undo');

      undoCommand.execute = function () {
        scribe.undoManager.undo();
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position < scribe.undoManager.length;
      };

      scribe.commands.undo = undoCommand;

      if (scribe.options.undo.enabled) {
        scribe.el.addEventListener('keydown', function (event) {
          // TODO: use lib to abstract meta/ctrl keys?
          if (! event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
            event.preventDefault();
            undoCommand.execute();
          }
        });
      }
    };
  };

});
