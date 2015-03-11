define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var redoCommand = new scribe.api.Command('redo');

      redoCommand.execute = function () {
        scribe.undoManager.redo();
      };

      redoCommand.queryEnabled = function () {
        return scribe.undoManager.position > 0;
      };

      scribe.commands.redo = redoCommand;

      //is scribe is configured to undo assign listener
      if (scribe.options.undo.enabled) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
            event.preventDefault();
            redoCommand.execute();
          }
        });
      }
    };
  };

});
