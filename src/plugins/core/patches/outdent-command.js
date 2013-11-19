define([
  '../../../api',
  '../../../api/selection'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      function outdentCommand(value) {
        /**
         * Chrome: If we apply the outdent command on a P, the contents of the P
         * will be outdented instead of the whole P element.
         * As per: http://jsbin.com/IfaRaFO/1/edit?html,js,output
         */
        var selection = new api.Selection();

        var pNode = selection.getContaining(function (node) {
          return node.nodeName === 'P';
        });

        if (pNode) {
          var blockquoteNode = selection.getContaining(function (node) {
            return node.nodeName === 'BLOCKQUOTE';
          });

          selection.placeMarkers();

          editor.el.insertBefore(pNode, blockquoteNode.nextElementSibling);

          selection.selectMarkers(editor.el);

          editor.pushHistory();
        }

        document.execCommand('outdent', false, value);
      }

      editor.patchedCommands.outdent = outdentCommand;
    };
  };

});
