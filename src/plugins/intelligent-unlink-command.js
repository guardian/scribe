define([
  '../api',
  '../api/command',
  '../api/selection'
], function (
  api
) {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  'use strict';

  return function () {
    return function (editor) {
      var unlinkCommand = new api.Command(editor, 'unlink');

      unlinkCommand.execute = function () {
        var selection = new api.Selection();

        if (selection.selection.isCollapsed) {
          /**
           * If the selection is collapsed, we can remove the containing anchor.
           */

          var aNode = selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });

          if (aNode) {
            while (aNode.childNodes.length > 0) {
              aNode.parentNode.insertBefore(aNode.childNodes[0], aNode);
            }
            aNode.remove();

            editor.pushHistory();
            editor.trigger('content-changed');
          }
        } else {
          api.Command.prototype.execute.apply(this, arguments);
        }
      };

      unlinkCommand.queryEnabled = function () {
        var selection = new api.Selection();
        if (selection.selection.isCollapsed) {
          return !! selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });
        } else {
          return api.Command.prototype.queryEnabled.apply(this, arguments);
        }
      };

      editor.commands.unlink = unlinkCommand;
    };
  };

});
