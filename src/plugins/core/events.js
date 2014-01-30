define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var selection = new scribe.api.Selection();
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
          if (event.keyCode === 13 || event.keyCode === 8) { // enter || backspace

            var selection = new scribe.api.Selection();
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

      /**
       * Chrome: Altering the paragraph structure by pressing
       * <backspace> or <delete> (merging/deleting paragraphs) sometimes
       * results in the application of a line-height attribute to the
       * contents of the paragraph, either onto existing elements or
       * by wrapping text in a span.
       * As per: http://jsbin.com/isIdoKA/4/edit?html,css,js,output
       */
      // TODO: do we need to run this on every key press, or could we
      //       detect when the issue may have occurred?
      // TODO: run in a transaction so as to record the change? how do
      //       we know in advance whether there will be a change though?
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keyup', function (event) {
          if (event.keyCode === 8 || event.keyCode === 46) { // backspace or delete

            var selection = new scribe.api.Selection();
            var range = selection.range;

            if (range.collapsed) {
              var containerPElement = selection.getContaining(function (node) {
                return node.nodeName === 'P';
              });
              if (containerPElement) {
                // Store the caret position
                selection.placeMarkers();

                // We clone the childNodes into an Array so that it's
                // not affected by any manipulation below when we
                // iterate over it
                var pElementChildNodes = Array.prototype.slice.call(containerPElement.childNodes);
                pElementChildNodes.forEach(function(pElementChildNode) {
                  if (pElementChildNode.nodeName === 'SPAN') {
                    // Unwrap any SPAN that has been inserted
                    // TODO: unwrap API
                    var spanElement = pElementChildNode;
                    while (spanElement.childNodes.length > 0) {
                      spanElement.parentNode.insertBefore(spanElement.childNodes[0], spanElement);
                    }
                    spanElement.parentNode.removeChild(spanElement);
                  } else if (pElementChildNode.nodeType === Node.ELEMENT_NODE) {
                    /**
                     * If the paragraph contains inline elements such as
                     * A, B, or I, Chrome will also append an inline style for
                     * `line-height` on those elements, so we remove it here.
                     */
                    pElementChildNode.style.lineHeight = null;
                  }
                });

                selection.selectMarkers();
              }
            }
          }
        });
      }


      /**
       * Run formatters on paste
       */

      /**
       * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
       * I also don't like how it has the authority to perform `event.preventDefault`.
       */

      scribe.el.addEventListener('paste', function handlePaste(event) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * will execute the second branch here.
         */
        var data;
        if (event.clipboardData) {
          event.preventDefault();
          // TODO: what data should we be getting?
          data = event.clipboardData.getData('text/html') ||
            escapeHtml(event.clipboardData.getData('text/plain'));

          scribe.insertHTML(data);
        } else {
          /**
           * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
           * sequence of events:
           *
           *   - Save the text selection
           *   - Focus another, hidden textarea so we paste there
           *   - Copy the pasted content of said textarea
           *   - Give focus back to the scribe
           *   - Restore the text selection
           *
           * This is required because, without access to the Clipboard API, there is literally
           * no other way to manipulate content on paste.
           * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
           *
           * Firefox <= 21
           * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent.clipboardData
           */

          var selection = new scribe.api.Selection();

          // Store the caret position
          selection.placeMarkers();

          var bin = document.createElement('div');
          document.body.appendChild(bin);
          bin.setAttribute('contenteditable', true);
          bin.focus();

          // Wait for the paste to happen (next loop?)
          setTimeout(function () {
            data = bin.innerHTML;
            bin.parentNode.removeChild(bin);

            // Restore the caret position
            selection.selectMarkers();
            /**
             * Firefox 19 (and maybe others): even though the applied range
             * exists within the Scribe instance, we need to focus it.
             */
            scribe.el.focus();

            scribe.insertHTML(data);
          }, 1);
        }
      });


      function escapeHtml(str) {
        return String(str).
          replace(/&/g, '&amp;').
          replace(/</g, '&lt;').
          replace(/>/g, '&gt;').
          replace(/"/g, '&quot;');
      }

    };
  };
});
