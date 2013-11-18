define([
  '../../../api',
  '../../../api/selection',
  '../../../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      function insertListCommand(value) {
        document.execCommand('insertOrderedList', false, value);

        /**
         * Chrome: If we apply the insertOrderedList command on an empty P, the
         * OL/UL will be nested inside the P.
         * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
         */
        var selection = new api.Selection();

        var listNode = selection.getContaining(function (node) {
          return node.nodeName === 'OL' || node.nodeName === 'UL';
        });

        if (listNode) {
          var listParentNode = listNode.parentNode;

          // If list is within a text block then split that block
          if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParentNode.nodeName)) {
            selection.placeMarkers();
            editable.el.insertBefore(listNode, listParentNode.nextElementSibling);
            selection.selectMarkers(editable.el);
          }
        }
      }

      editable.patchedCommands.insertOrderedList = insertListCommand;
      editable.patchedCommands.insertUnorderedList = insertListCommand;
    };
  };

});
