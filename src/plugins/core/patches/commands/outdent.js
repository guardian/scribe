define([
  '../../../../api/command-patch',
  '../../../../api/node',
  '../../../../api/selection'
], function (
  CommandPatch,
  Node,
  Selection
) {

  /**
   * Prevent Chrome from removing formatting of BLOCKQUOTE contents.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var outdentCommand = new CommandPatch('outdent');

      outdentCommand.execute = function () {
        var selection = new Selection();
        var range = selection.range;

        if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
          /**
           * Chrome: Applying the outdent command when a whole BLOCKQUOTE is
           * selected removes the formatting of its contents.
           * As per: http://jsbin.com/okAYaHa/1/edit?html,js,output
           */
          var blockquoteNode = range.commonAncestorContainer;

          // Insert a copy of the selection before the BLOCKQUOTE, and then
          // restore the selection on the copy.
          selection.placeMarkers();
          // We want to copy the selected nodes *with* the markers
          selection.selectMarkers(scribe.el, true);
          var selectedNodes = range.cloneContents();
          blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
          range.deleteContents();
          selection.selectMarkers(scribe.el);

          // Delete the BLOCKQUOTE if it's empty
          if (blockquoteNode.innerText === '') {
            blockquoteNode.parentNode.removeChild(blockquoteNode);
          }
        } else {
          /**
           * Chrome: If we apply the outdent command on a P, the contents of the
           * P will be outdented instead of the whole P element.
           * As per: http://jsbin.com/IfaRaFO/1/edit?html,js,output
           */

          var pNode = selection.getContaining(function (node) {
            return node.nodeName === 'P';
          });

          if (pNode) {
            var blockquoteNode = selection.getContaining(function (node) {
              return node.nodeName === 'BLOCKQUOTE';
            });

            /**
             * If we are not at the start of end of a BLOCKQUOTE, we have to
             * split the node and insert the P in the middle.
             */

            var nextSiblingNodes = (new Node(pNode)).nextAll();

            if (nextSiblingNodes.length) {
              var newContainerNode = document.createElement(blockquoteNode.nodeName);

              nextSiblingNodes.forEach(function (siblingNode) {
                newContainerNode.appendChild(siblingNode);
              });

              blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
            }

            selection.placeMarkers();
            blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
            selection.selectMarkers(scribe.el);

            // If the BLOCKQUOTE is now empty, clean it up.
            if (blockquoteNode.innerHTML === '') {
              blockquoteNode.parentNode.removeChild(blockquoteNode);
            }
          } else {
            CommandPatch.prototype.execute.call(this);
          }
        }

        scribe.pushHistory();
        scribe.trigger('content-changed');
      };

      scribe.commandPatches.outdent = outdentCommand;
    };
  };

});
