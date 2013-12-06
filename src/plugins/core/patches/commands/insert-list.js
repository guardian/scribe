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
   * Chrome: If we apply the insertOrderedList command on an empty P, the
   * OL/UL will be nested inside the P.
   * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
   */

  'use strict';

  return function () {
    return function (scribe) {
      var InsertListCommandPatch = function (commandName) {
        CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        CommandPatch.prototype.execute.call(this, value);

        if (this.queryState()) {
          var selection = new Selection();

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          if (listNode) {
            var listParentNode = listNode.parentNode;

            // If list is within a text block then split that block
            if (listParentNode && /^(H[1-6]|P|ADDRESS|PRE)$/.test(listParentNode.nodeName)) {
              selection.placeMarkers();
              listParentNode.parentNode.insertBefore(listNode, listParentNode.nextElementSibling);
              selection.selectMarkers(scribe.el);
              listParentNode.parentNode.removeChild(listParentNode);

              scribe.pushHistory();
              scribe.trigger('content-changed');
            }
          }
        }
      };

      scribe.patchedCommands.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      scribe.patchedCommands.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});
