define([
  '../../api/selection',
], function (
  Selection
) {
  return function () {
    return function (scribe) {
      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var selection = new Selection();
            var range = selection.range;

            var headingNode = selection.getContaining(function (node) {
              return (/^(H[1-6])$/).test(node.nodeName);
            });

            /**
             * If we are at the end of the heading, insert a P. Otherwise handle
             * natively.
             */
            if (headingNode && range.collapsed) {
              var contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(headingNode, 0);

              // Get the content from the range to the end of the heading
              var contentToEndFragment = contentToEndRange.cloneContents();

              if (contentToEndFragment.firstChild.innerText === '') {
                event.preventDefault();

                // Default P
                // TODO: Abstract somewhere
                var pNode = document.createElement('p');
                var brNode = document.createElement('br');
                pNode.appendChild(brNode);

                headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);

                // Re-apply range
                range.setStart(pNode, 0);
                range.setEnd(pNode, 0);

                selection.selection.removeAllRanges();
                selection.selection.addRange(range);

                scribe.pushHistory();
                scribe.trigger('content-changed');
              }
            }
          }
        });
      }

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside list item nodes.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13 || event.keyCode === 8) { // enter

            var selection = new Selection();
            var range = selection.range;

            if (range.collapsed) {
              // FIXME: confirm whether to use innerText or innerHTML
              if (range.commonAncestorContainer.nodeName === 'LI'
                && (range.commonAncestorContainer.innerText === '' || range.commonAncestorContainer.innerHTML === '<br>')) {
                /**
                 * LIs
                 */

                event.preventDefault();

                var listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.execute();
              }
            }
          }
        });
      }
    };
  };
});
