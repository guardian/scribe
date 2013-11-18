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
        restoreUndoItem(editable.undoManager.undo());
      };

      editable.commands.undo = undoCommand;

      var redoCommand = new api.Command('redo');

      redoCommand.execute = function () {
        restoreUndoItem(editable.undoManager.redo());
      };

      editable.commands.redo = redoCommand;

      function restoreUndoItem(item) {
        editable.el.innerHTML = item;

        // Restore the selection
        var selection = new api.Selection();
        selection.selectMarkers(editable.el);
      }
    };
  };

});
