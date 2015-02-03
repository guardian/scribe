define('scribe-plugin-intelligent-unlink-command',[], function () {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  

  return function () {
    return function (scribe) {
      var element = scribe.element;
      
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
              // we must save and then restore the selection because unwrapping
              // the anchor loses the current selection
              selection.placeMarkers();

              // unwrap the A element's children, then remove it
              element.unwrap(aNode.parentNode, aNode);

              // finally restore selection to the initial position
              selection.selectMarkers();
            }
          });
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