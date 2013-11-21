define([
  '../api',
  '../api/simple-command'
], function (
  api
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

      var headingCommand = new api.SimpleCommand(editor, 'formatBlock', nodeName);

      headingCommand.execute = function () {
        if (this.queryState()) {
          api.Command.prototype.execute.call(this, '<p>');
        } else {
          api.Command.prototype.execute.call(this, tag);
        }
      };

      editor.commands[commandName] = headingCommand;

      /**
       * Handle keyboard navigation (i.e. when the user does a carriage return
       * inside a heading).
       */

      var INVISIBLE_CHAR = '\uFEFF';

      // FIXME: currently this plugin has to be used multiple times, once for
      // each heading level, which means we are binding this event multiple
      // times.

      editor.el.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {

          var selection = new api.Selection();
          var range = selection.range;

          if (range.collapsed) {
            if (range.commonAncestorContainer instanceof window.Text
              && /^(H[1-6])$/.test(range.commonAncestorContainer.parentNode.nodeName)) {
              // Wait for the native behaivour to occur, and then apply the
              // command. We assume this will be in the next tick.
              setTimeout(function () {
                api.Command.prototype.execute.call(headingCommand, '<p>');
              }, 0);
            }
          }
        }
      });
    };
  };

});
