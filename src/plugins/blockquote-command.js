define([
  '../api/simple-command'
], function (
  SimpleCommand
) {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  'use strict';

  return function () {
    return function (editor) {
      var blockquoteCommand = new SimpleCommand(editor, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = editor.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = editor.getCommand(this.queryState() ? 'outdent' : 'indent');
        return command.queryEnabled();
      };

      editor.commands.blockquote = blockquoteCommand;
    };
  };

});
