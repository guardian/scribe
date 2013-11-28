define([
  '../../../../api/command-patch',
  '../../../../api/selection'
], function (
  CommandPatch,
  Selection
) {

  /**
   * Prevent Chrome from inserting BLOCKQUOTEs inside of Ps, and also from
   * adding a redundant `style` attribute to the created BLOCKQUOTE.
   */

  'use strict';

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (editor) {
      var indentCommand = new CommandPatch('indent');

      indentCommand.execute = function (value) {
        /**
         * Chrome: If we apply the indent command on an empty P, the
         * BLOCKQUOTE will be nested inside the P.
         * As per: http://jsbin.com/oDOriyU/3/edit?html,js,output
         */
        var selection = new Selection();
        var range = selection.range;

        if (range.commonAncestorContainer.nodeName === 'P') {
          // FIXME: this text node is left behind. Tidy it up somehow,
          // or don't use it at all.
          var textNode = document.createTextNode(INVISIBLE_CHAR);

          range.insertNode(textNode);

          range.setStart(textNode, 0);
          range.setEnd(textNode, 0);

          selection.selection.removeAllRanges();
          selection.selection.addRange(range);
        }

        CommandPatch.prototype.execute.call(this, value);

        /**
         * Chrome: The BLOCKQUOTE created contains a redundant style attribute.
         * As per: http://jsbin.com/AkasOzu/1/edit?html,js,output
         */

        // Renew the selection
        selection = new Selection();
        var blockquoteNode = selection.getContaining(function (node) {
          return node.nodeName === 'BLOCKQUOTE';
        });
        blockquoteNode.removeAttribute('style');

        editor.pushHistory();
        editor.trigger('content-changed');
      };

      editor.patchedCommands.indent = indentCommand;
    };
  };

});
