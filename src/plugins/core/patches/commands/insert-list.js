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
   * Prevent Chrome from inserting lists (UL/OL) inside of Ps. Also patches
   * behaviour of unapplying a list so that a P is always created, although this
   * should probably be moved.
   */

  'use strict';

  return function () {
    return function (editor) {
      var InsertListCommandPatch = function (commandName) {
        CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        CommandPatch.prototype.execute.call(this, value);

        if (! this.queryState()) {
          /**
           * Chrome: If we apply the insertOrderedList command on an empty P, the
           * OL/UL will be nested inside the P.
           * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
           */

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
              selection.selectMarkers(editor.el);
              listParentNode.remove();

              editor.pushHistory();
              editor.trigger('content-changed');
            }
          }
        }
      };

      editor.patchedCommands.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      editor.patchedCommands.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});
