define(function () {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var unlinkCommand = new scribe.api.Command('unlink');

      unlinkCommand.execute = function () {
        var selection = new scribe.api.Selection();

        if (selection.selection.isCollapsed) {
          scribe.transactionManager.run(function () {
            /**
             * If the selection is collapsed, we can remove the containing anchor.
             */

            var aNode = selection.getContaining(function (node) {
              return node.nodeName === 'A';
            });

            if (aNode) {
              new scribe.api.Element(aNode.parentNode).unwrap(aNode);
            }
          }.bind(this));
        } else {
          // if an A tag has a class, Firefox replaces the A tag with a span with the same class
          var range, node;
          range = selection.selection.getRangeAt(0)
          node = range.commonAncestorContainer;
          if (node.nodeName === 'A') node.className = null;
          node = range.startContainer;
          do {
            if (node.nodeName === 'A') node.className = null;
            node = node.nextSibling;
          } while (node && node != range.endContainer);
          // end:if an A tag has a class, Firefox replaces the A tag with a span with the same class
          scribe.api.Command.prototype.execute.apply(this, arguments);
        }
      };

      unlinkCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        if (selection.selection.isCollapsed) {
          return !! selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });
        } else {
          return scribe.api.Command.prototype.queryEnabled.apply(this, arguments);
        }
      };

      scribe.commands.unlink = unlinkCommand;
    };
  };

});
