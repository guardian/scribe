define([
  '../api',
  '../api/selection',
  '../api/simple-command'
], function (
  api
) {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  'use strict';

  return function () {
    return function (editor) {
      var blockquoteCommand = new api.SimpleCommand(editor, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command;
        if (this.queryState()) {
          command = editor.getCommand('outdent');
        } else {
          command = editor.getCommand('indent');
        }
        command.execute();
      };

      editor.commands.blockquote = blockquoteCommand;
    };
  };

});
