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

          editable.el.insertBefore(pNode, blockquoteNode.nextElementSibling);

          selection.selectMarkers(editable.el);
        }

        document.execCommand('outdent', false, value);
      }

      editable.patchedCommands.outdent = outdentCommand;
    };
  };

});
