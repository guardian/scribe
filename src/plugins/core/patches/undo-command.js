define([
  '../../../api',
  '../../../api/command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var undoCommand = new api.Command('undo');

      undoCommand.execute = function () {
        editable.undoManager.undo();
      };

      editable.commands.undo = undoCommand;

      var redoCommand = new api.Command('redo');

      redoCommand.execute = function () {
        editable.undoManager.redo();
      };

      editable.commands.redo = redoCommand;
    };
  };

});
