define('scribe-plugin-intelligent-unlink-command',[],function () {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  

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

//# sourceMappingURL=scribe-plugin-intelligent-unlink-command.js.map