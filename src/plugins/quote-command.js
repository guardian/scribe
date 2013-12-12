define([
  '../api/simple-command',
  '../api/selection'
], function (
  SimpleCommand,
  Selection
) {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var quoteCommand = new SimpleCommand(scribe, 'blockquote', 'BLOCKQUOTE');

      quoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();

        if (SimpleCommand.prototype.queryState.call(this)) {
          // TODO: transactions!
          // We want to erase the stack item that was previously added.
          scribe.undoManager.stack.length = scribe.undoManager.position;
          --scribe.undoManager.position;

          var selection = new Selection();
          var blockquoteElement = selection.getContaining(function (element) {
            return element.nodeName === 'BLOCKQUOTE';
          });

          blockquoteElement.classList.add('quote');

          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      };

      quoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        return command.queryEnabled();
      };

      quoteCommand.queryState = function () {
        var selection = new Selection();
        var blockquoteElement = selection.getContaining(function (element) {
          return element.nodeName === 'BLOCKQUOTE';
        });

        return blockquoteElement && blockquoteElement.classList.toString() === 'quote';
      };

      scribe.commands.quote = quoteCommand;
    };
  };

});
