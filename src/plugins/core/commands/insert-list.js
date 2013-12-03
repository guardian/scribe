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
    return function (scribe) {
      var InsertListCommand = function (commandName) {
        Command.call(this, scribe, commandName);
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

          selection.selectMarkers(scribe.el);

          scribe.pushHistory();
          scribe.trigger('content-changed');
        } else {
          Command.prototype.execute.call(this, value);
        }
      };

      if (scribe.options.paragraphs) {
        scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
        scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
      }
    };
  };

});
