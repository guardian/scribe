define([
  '../../../../api/command-patch',
  '../../../../api/selection'
], function (
  CommandPatch,
  Selection
) {

  'use strict';

  return function () {
    return function (editor) {
      var boldCommand = new CommandPatch('bold');

      /**
       * Chrome: Executing the bold command inside a heading corrupts the markup.
       * Disabling for now.
       */
      boldCommand.queryEnabled = function () {
        var selection = new Selection();
        var headingNode = selection.getContaining(function (node) {
          return (/^(H[1-6])$/).test(node.nodeName);
        });

        return CommandPatch.prototype.queryEnabled.apply(this, arguments) && ! headingNode;
      };

      // TODO: We can't use STRONGs because this would mean we have to
      // re-implement the `queryState` command, which would be difficult.

      editor.patchedCommands.bold = boldCommand;
    };
  };

});
