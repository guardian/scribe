define([
  '../api/command',
  '../api/command-patch',
  '../api/selection',
  '../api/simple-command'
], function (
  Command,
  CommandPatch,
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

        return CommandPatch.prototype.queryEnabled.apply(this, arguments) && ! listNode;
      };

      editor.commands[commandName] = headingCommand;

      /**
       * Handle keyboard navigation (i.e. when the user does a carriage return
       * inside a heading).
       */

      // FIXME: currently this plugin has to be used multiple times, once for
      // each heading level, which means we are binding this event multiple
      // times.

      editor.el.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {

          var selection = new Selection();
          var range = selection.range;

          var headingNode = selection.getContaining(function (node) {
            return (/^(H[1-6])$/).test(node.nodeName);
          });

          /**
           * If we are at the end of the heading, insert a P. Otherwise handle
           * natively.
           */
          if (headingNode && range.collapsed) {
            var contentToEndRange = range.cloneRange();
            contentToEndRange.setEndAfter(headingNode, 0);

            // Get the content from the range to the end of the heading
            var contentToEndFragment = contentToEndRange.cloneContents();

            if (contentToEndFragment.firstChild.innerText === '') {
              event.preventDefault();

              // Default P
              // TODO: Abstract somewhere
              var pNode = document.createElement('p');
              var brNode = document.createElement('br');
              pNode.appendChild(brNode);

              headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);

              // Re-apply range
              range.setStart(pNode, 0);
              range.setEnd(pNode, 0);

              selection.selection.removeAllRanges();
              selection.selection.addRange(range);

              editor.pushHistory();
              editor.trigger('content-changed');
            }
          }
        }
      });
    };
  };

});
