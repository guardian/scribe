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
      var blockquoteCommand = new SimpleCommand(scribe, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');

        /**
         * FIXME: Chrome nests ULs inside of ULs
         * Currently we just disable the command when the selection is inside of
         * a list.
         * As per: http://jsbin.com/ORikUPa/3/edit?html,js,output
         */
        var selection = new Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        return command.queryEnabled() && ! listElement;
      };

      blockquoteCommand.queryState = function () {
        var selection = new Selection();
        var blockquoteElement = selection.getContaining(function (element) {
          return element.nodeName === 'BLOCKQUOTE';
        });

        return scribe.allowsBlockElements() && !! blockquoteElement;
      };

      scribe.commands.blockquote = blockquoteCommand;
    };
  };

});
