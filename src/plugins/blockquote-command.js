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
    return function (scribe) {
      var blockquoteCommand = new SimpleCommand(scribe, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        return scribe.options.paragraphs && command.queryEnabled();
      };

      scribe.commands.blockquote = blockquoteCommand;
    };
  };

});
