define([
  '../../../api',
  '../../../api/selection',
  '../../../api/simple-command'
], function (
  api
) {

  'use strict';

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (editor) {
      var InsertListCommandPatch = function (commandName) {
        api.CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(api.CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        if (this.queryState()) {
          var selection = new api.Selection();
          var range = selection.range;

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          selection.placeMarkers();

          var listItemNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI';
          });

          var pNode = document.createElement('p');
          pNode.innerHTML = listItemNode.innerHTML;

          editor.el.insertBefore(pNode, listNode.nextElementSibling);
          listItemNode.remove();

          selection.selectMarkers(editor.el);

          editor.pushHistory();
        } else {
          api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: If we apply the insertOrderedList command on an empty P, the
           * OL/UL will be nested inside the P.
           * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
           */
          // TODO: remove empty P

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
              editor.el.insertBefore(listNode, listParentNode.nextElementSibling);
              selection.selectMarkers(editor.el);

              editor.pushHistory();
            }
          }
        }
      };

      editor.patchedCommands.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      editor.patchedCommands.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});
