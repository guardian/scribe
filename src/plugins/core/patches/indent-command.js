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
    return function (editable) {
      function indentCommand(value) {
        /**
         * Chrome: If we apply the indent command on an empty P, the
         * BLOCKQUOTE will be nested inside the P.
         * As per: http://jsbin.com/oDOriyU/1/edit?html,js,output
         */
        var selection = new api.Selection();
        var range = selection.range;

        if (range.commonAncestorContainer.nodeName === 'P') {
          var textNode = document.createTextNode(INVISIBLE_CHAR);

          range.insertNode(textNode);

          range.setStart(textNode);
          range.setEnd(textNode);

          selection.selection.removeAllRanges();
          selection.selection.addRange(range);
        }

        document.execCommand('indent', false, value);
      }

      editable.patchedCommands.indent = indentCommand;
    };
  };

});
