define(function () {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var blockquoteCommand = new scribe.api.SimpleCommand('blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        return command.queryEnabled();
      };

      blockquoteCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        var blockquoteElement = selection.getContaining(function (element) {
          return element.nodeName === 'BLOCKQUOTE';
        });

        return scribe.allowsBlockElements() && !! blockquoteElement;
      };

      scribe.commands.blockquote = blockquoteCommand;
    };
  };

});
