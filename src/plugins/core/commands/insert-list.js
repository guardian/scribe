define([
  '../../../api/command',
  '../../../api/node',
  '../../../api/selection'
], function (
  Command,
  Node,
  Selection
) {

  /**
   * If the paragraphs option is set to true, then when the list is
   * unapplied, ensure that we enter a P element.
   */

  'use strict';

  return function () {
    return function (editor) {
      var InsertListCommand = function (commandName) {
        Command.call(this, editor, commandName);
      };

      InsertListCommand.prototype = Object.create(Command.prototype);
      InsertListCommand.prototype.constructor = InsertListCommand;

      InsertListCommand.prototype.execute = function (value) {
        if (this.queryState()) {
          var selection = new Selection();

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          var listItemNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI';
          });

          /**
           * If we are not at the start of end of a UL/OL, we have to
           * split the node and insert the P in the middle.
           */

          var nextListItemNodes = (new Node(listItemNode)).nextAll();

          if (nextListItemNodes.length) {
            var newListNode = document.createElement(listNode.nodeName);

            nextListItemNodes.forEach(function (listItemNode) {
              newListNode.appendChild(listItemNode);
            });

            listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
          }

          /**
           * Insert a paragraph in place of the list item.
           */

          selection.placeMarkers();

          var pNode = document.createElement('p');
          pNode.innerHTML = listItemNode.innerHTML;

          listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
          listItemNode.remove();

          // If the list is now empty, clean it up.
          if (listNode.innerHTML === '') {
            listNode.remove();
          }

          selection.selectMarkers(editor.el);

          editor.pushHistory();
          editor.trigger('content-changed');
        } else {
          Command.prototype.execute.call(this, value);
        }
      };

      if (editor.options.paragraphs) {
        editor.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
        editor.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');

        /**
         * Handle keyboard navigation (i.e. when the user does a carriage
         * return on the last, empty list item).
         */

        editor.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) {

            var selection = new Selection();
            var range = selection.range;

            if (range.collapsed) {
              if (range.commonAncestorContainer.nodeName === 'LI'
                && range.commonAncestorContainer.innerHTML === '<br>') {
                // TODO: test innerText instead?
                /**
                 * LIs
                 */

                event.preventDefault();

                var listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                var command = editor.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.execute();
              }
            }
          }
        });
      }
    };
  };

});
