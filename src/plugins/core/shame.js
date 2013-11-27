define([
  '../../api/selection',
], function (
  Selection
) {
  return function () {
    return function (editor) {
      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (editor.options.paragraphs) {
        editor.el.addEventListener('keypress', function (event) {
          if (event.keyCode === 13) {

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

                editor.pushHistory();
                editor.trigger('content-changed');
              }
            }
          }
        });
      }

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside list item nodes.
       */
      if (editor.options.paragraphs) {
        editor.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) {

            var selection = new Selection();
            var range = selection.range;

            if (range.collapsed) {
              if (range.commonAncestorContainer.nodeName === 'LI'
                && range.commonAncestorContainer.innerHTML === '<br>') {
                // TODO: test innerText instead?
                /**
                 * LIs
                 */

                event.preventDefault();

                var listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                var command = editor.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.execute();
              }
            }
          }
        });
      }
    };
  };
});