define([
  '../../../api',
  '../../../api/node',
  '../../../api/selection',
  '../../../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      var InsertListCommandPatch = function (commandName) {
        api.CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(api.CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        if (this.queryState()) {
          /**
           * When the list is unapplied, ensure that we enter a P element.
           * TODO: should this be a feature instead of a patch? It is not really
           * a browser inconsistency and the user might have disabled root P.
           */
          var selection = new api.Selection();
          var range = selection.range;

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

          var nextListItemNodes = (new api.Node(listItemNode)).nextAll();

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

          editor.trigger('content-change');
        } else {
          api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: If we apply the insertOrderedList command on an empty P, the
           * OL/UL will be nested inside the P.
           * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
           */

          var selection = new api.Selection();
          var range = selection.range;

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          if (listNode) {
            var listParentNode = listNode.parentNode;

            // If list is within a text block then split that block
            if (listParentNode && /^(H[1-6]|P|ADDRESS|PRE)$/.test(listParentNode.nodeName)) {
              selection.placeMarkers();
              listParentNode.parentNode.insertBefore(listNode, listParentNode.nextElementSibling);
              selection.selectMarkers(editor.el);
              listParentNode.remove();

              editor.trigger('content-change');
            }
          }
        }

        /**
         * Handle keyboard navigation (i.e. when the user does a carriage
         * return on the last, empty list item).
         */

        editor.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) {

            var selection = new api.Selection();
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
      };

      editor.patchedCommands.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      editor.patchedCommands.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});
