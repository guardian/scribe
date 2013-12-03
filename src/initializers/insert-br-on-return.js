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
            // The first <br> is the line break, the second <br> is simply
            // where the caret will go (and replace).
            var brNode = document.createElement('br');
            var caretBrNode = document.createElement('br');

            range.insertNode(brNode);
            // After inserting the BR into the range is no longer collapsed, so
            // we have to collapse it again.
            range.collapse();
            range.insertNode(caretBrNode);

            var newRange = new window.Range();

            newRange.setStartAfter(caretBrNode, 0);
            newRange.setEndAfter(caretBrNode, 0);

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
