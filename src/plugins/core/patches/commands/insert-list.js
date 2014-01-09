define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var InsertListCommandPatch = function (commandName) {
        scribe.api.CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(scribe.api.CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          if (this.queryState()) {
            /**
             * Chrome: If we apply the insertOrderedList command on an empty block, the
             * OL/UL will be nested inside the block.
             * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
             */

            var selection = new scribe.api.Selection();

            var listNode = selection.getContaining(function (node) {
              return node.nodeName === 'OL' || node.nodeName === 'UL';
            });

            if (listNode) {
              var listParentNode = listNode.parentNode;

              // If list is within a text block then split that block
              if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                selection.placeMarkers();
                listParentNode.parentNode.insertBefore(listNode, listParentNode.nextElementSibling);
                selection.selectMarkers();
                listParentNode.parentNode.removeChild(listParentNode);
              }
            }

            /**
             * Chrome: If a parent node has a CSS `line-height` when we apply the
             * insert(Un)OrderedList command, Chrome appends a SPAN to LIs with
             * inline styling replicating that `line-height`.
             * As per: http://jsbin.com/OtemujAY/7/edit?html,css,js,output
             *
             * FIXME: what if the user actually wants to use SPANs? This could
             * cause conflicts.
             * TODO: only remove top level SPAN in LI?
             */

            var treeWalker = document.createTreeWalker(listNode);

            while (treeWalker.nextNode()) {
              if (treeWalker.currentNode.nodeName === 'SPAN') {
                // TODO: unwrap API
                var spanElement = treeWalker.currentNode;
                while (spanElement.childNodes.length > 0) {
                  spanElement.parentNode.insertBefore(spanElement.childNodes[0], spanElement);
                }
                spanElement.parentNode.removeChild(spanElement);
              }
            }
          }
        }.bind(this));
      };

      scribe.commandPatches.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      scribe.commandPatches.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});
