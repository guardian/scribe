define([
  '../api/selection',
  '../api/simple-command'
], function (
  Selection,
  SimpleCommand
) {

  /**
   * This plugin adds a command for headings.
   */

  'use strict';

  return function (level) {
    return function (editor) {
      var tag = '<h' + level + '>';
      var nodeName = 'H' + level;
      var commandName = 'h' + level;

      /**
       * Chrome: the `heading` command doesn't work. Supported by Firefox only.
       */

      var headingCommand = new SimpleCommand(editor, 'formatBlock', nodeName);

      headingCommand.execute = function () {
        if (this.queryState()) {
          SimpleCommand.prototype.execute.call(this, '<p>');
        } else {
          SimpleCommand.prototype.execute.call(this, tag);
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

        return SimpleCommand.prototype.queryEnabled.apply(this, arguments) && ! listNode;
      };

      editor.commands[commandName] = headingCommand;
    };
  };

});
