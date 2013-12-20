define([
  '../api/command',
  '../api/selection'
], function (
  Command,
  Selection
) {

  /**
   * This plugin adds a command for headings.
   */

  'use strict';

  return function (level) {
    return function (scribe) {
      var tag = '<h' + level + '>';
      var nodeName = 'H' + level;
      var commandName = 'h' + level;

      /**
       * Chrome: the `heading` command doesn't work. Supported by Firefox only.
       */

      var headingCommand = new Command(scribe, 'formatBlock');

      headingCommand.execute = function () {
        if (this.queryState()) {
          Command.prototype.execute.call(this, '<p>');
        } else {
          Command.prototype.execute.call(this, tag);
        }
      };

      /**
       * All: Executing a heading command inside a list element corrupts the markup.
       * Disabling for now.
       */
      headingCommand.queryEnabled = function () {
        var selection = new Selection();
        var listNode = selection.getContaining(function (node) {
          return node.nodeName === 'OL' || node.nodeName === 'UL';
        });

        return Command.prototype.queryEnabled.apply(this, arguments)
          && scribe.allowsBlockElements() && ! listNode;
      };

      scribe.commands[commandName] = headingCommand;
    };
  };

});
