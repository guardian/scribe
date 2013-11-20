define([
  '../api',
  '../api/command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      var unlinkCommand = new api.Command(editor, 'unlink');

      unlinkCommand.execute = function () {
        var selection = new api.Selection();

        if (selection.selection.isCollapsed) {
          var aNode = selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });

          if (aNode) {
            while (aNode.childNodes.length > 0) {
              aNode.parentNode.insertBefore(aNode.childNodes[0], aNode);
            }
            aNode.remove();

            editor.trigger('content-change');
          }
        } else {
          api.Command.prototype.execute.apply(this, arguments);
        }
      };

      editor.commands.unlink = unlinkCommand;
    };
  };

});
