define([
  '../api/selection'
], function (
  Selection
) {
  'use strict';

  return function () {
    return function (scribe) {
      /**
       * Firefox has a `insertBrOnReturn` command, but this is not a part of
       * any standard. One day we might have an `insertLineBreak` command,
       * proposed by this spec:
       * https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-insertlinebreak-command
       * As per: http://jsbin.com/IQUraXA/1/edit?html,js,output
       */
      scribe.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { // enter
          var selection = new Selection();
          var range = selection.range;

          var blockNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI' || (/^(H[1-6])$/).test(node.nodeName);
          });

          if (! blockNode) {
            event.preventDefault();
            var brNode = document.createElement('br');

            range.insertNode(brNode);
            // After inserting the BR into the range is no longer collapsed, so
            // we have to collapse it again.
            range.collapse();

            // If there is no right-hand side content, we have to insert an
            // additional BR in order for the line break to appear. Not to worry
            // as this is replaced as soon as the user begins typing.
            var endNode;
            if (! brNode.nextElementSibling) {
              var caretBrNode = document.createElement('br');
              endNode = caretBrNode;
              range.insertNode(caretBrNode);
            } else {
              endNode = brNode;
            }

            // Set the selection to the end of whichever BR node we inserted
            // last.

            var newRange = range.cloneRange();

            newRange.setStartAfter(endNode, 0);
            newRange.setEndAfter(endNode, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(newRange);

            scribe.pushHistory();
            scribe.trigger('content-changed');
          }
        }
      }.bind(this));

      if (scribe.getHTML() === '') {
        scribe.pushHistory();
        scribe.trigger('content-changed');
      }
    };
  };
});
