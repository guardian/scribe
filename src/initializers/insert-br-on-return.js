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
            // TODO: Older versions of Firefox require this argument even though
            // it is supposed to be optional. Proxy/polyfill?
            range.collapse(false);

            /**
             * Chrome: If there is no right-hand side content, inserting a BR
             * will not appear to create a line break.
             * Firefox: If there is no right-hand side content, inserting a BR
             * will appear to create a weird "half-line break".
             * Possible solution: Insert two BRs.
             *
             * ✓ Chrome: Inserting two BRs appears to create a line break.
             * Typing will then delete the bogus BR element.
             * Firefox: Inserting two BRs will create two line breaks.
             * Possible solution: Only insert two BRs if there is no right-hand
             * side content.
             *
             * If the user types on a line immediately after a BR element,
             * Chrome will replace the BR element with the typed characters,
             * whereas Firefox will not. Thus, to satisfy Firefox we have to
             * insert a bogus BR element on initialization (see below).
             */

            var contentToEndRange = range.cloneRange();
            contentToEndRange.setEndAfter(scribe.el.lastElementChild, 0);

            // Get the content from the range to the end of the heading
            var contentToEndFragment = contentToEndRange.cloneContents();

            // If there is not already a right hand side content we need to
            // insert a bogus BR element.
            var endNode;
            if (! contentToEndFragment.childNodes.length) {
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
        // Bogus BR element for Firefox — see explanation above.
        // TODO: also append when consumer sets the content manually.
        // TODO: hide when the user calls `getHTML`?
        scribe.setContent('');
      }
    };
  };
});
