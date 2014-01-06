define([
  '../api/command',
  '../api/selection'
], function (
  Command,
  Selection
) {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var unlinkCommand = new Command(scribe, 'unlink');

      unlinkCommand.execute = function () {
        var selection = new Selection();

        if (selection.selection.isCollapsed) {
          /**
           * If the selection is collapsed, we can remove the containing anchor.
           */

          var aNode = selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });

          if (aNode) {
            // TODO: unwrap API
            while (aNode.childNodes.length > 0) {
              aNode.parentNode.insertBefore(aNode.childNodes[0], aNode);
            }
            aNode.parentNode.removeChild(aNode);

            scribe.pushHistory();
            scribe.trigger('content-changed');
          }
        } else {
          Command.prototype.execute.apply(this, arguments);
        }
      };

      unlinkCommand.queryEnabled = function () {
        var selection = new Selection();
        if (selection.selection.isCollapsed) {
          return !! selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });
        } else {
          return Command.prototype.queryEnabled.apply(this, arguments);
        }
      };

      scribe.commands.unlink = unlinkCommand;
    };
  };

});
