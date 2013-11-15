define([
  '../../../api',
  '../../../api/command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var boldCommand = new api.Command('bold');

      boldCommand.execute = function () {
        var range = new api.Range();
        var h2Node = range.getContaining(function (node) {
          return node.nodeName === 'H2';
        });

        if (! h2Node) {
          api.Command.prototype.execute.apply(this, arguments);
        } else {
          /**
           * TODO: because we manipulate the DOM directly, these will not be
           * added to the undo stack.
           */
          var strongNode;
          if (this.queryState()) {
            strongNode = range.getContaining(function (node) {
              return node.nodeName === 'B' || node.nodeName === 'STRONG';
            });

            // Remove the containing strongNode
            // TODO: create unwrap function?
            while (strongNode.childNodes.length > 0) {
              h2Node.insertBefore(strongNode.childNodes[0], strongNode);
            }
            h2Node.removeChild(strongNode);
          } else {
            var node = range.commonAncestorContainer;
            strongNode = document.createElement('strong');

            // TODO: create wrap function
            node.parentNode.insertBefore(strongNode, node);
            strongNode.appendChild(node);
          }
        }
      };

      boldCommand.queryState = function () {
        var range = new api.Range();
        return !! range.getContaining(function (node) {
          return node.nodeName === 'B' || node.nodeName === 'STRONG';
        });
      };

      editable.commands.bold = boldCommand;
    };
  };

});
