define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      /**
       * Chrome: If a parent node has a CSS `line-height` when we apply the
       * insert(Un)OrderedList command, altering the paragraph structure by pressing
       * <backspace> or <delete> (merging/deleting paragraphs) sometimes
       * results in the application of a line-height attribute to the
       * contents of the paragraph, either onto existing elements or
       * by wrapping text in a span.
       * As per: http://jsbin.com/isIdoKA/4/edit?html,css,js,output
       *
       * FIXME: what if the user actually wants to use SPANs? This could
       * cause conflicts.
       */
      // TODO: do we need to run this on every key press, or could we
      //       detect when the issue may have occurred?
      // TODO: run in a transaction so as to record the change? how do
      //       we know in advance whether there will be a change though?
      // TODO: share somehow with `InsertList` command
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keyup', function (event) {
          if (event.keyCode === 8 || event.keyCode === 46) { // backspace or delete

            var selection = new scribe.api.Selection();
            var range = selection.range;

            // Note: the range is always collapsed on keyup here
            var containerPElement = selection.getContaining(function (node) {
              return node.nodeName === 'P';
            });
            if (containerPElement) {
              /**
               * The 'input' event listener has already triggered
               * and recorded the faulty content as an item in the
               * UndoManager.  We interfere with the undoManager
               * here to discard that history item, and let the next
               * transaction run produce a clean one instead.
               *
               * FIXME: ideally we would not trigger a
               * 'content-changed' event with faulty HTML at all, but
               * it's too late to cancel it at this stage (and it's
               * not happened yet at keydown time).
               */
              scribe.undoManager.undo();

              scribe.transactionManager.run(function () {
                // Store the caret position
                selection.placeMarkers();

                // We clone the childNodes into an Array so that it's
                // not affected by any manipulation below when we
                // iterate over it
                var pElementChildNodes = Array.prototype.slice.call(containerPElement.childNodes);
                pElementChildNodes.forEach(function(pElementChildNode) {
                  if (pElementChildNode.nodeName === 'SPAN') {
                    // Unwrap any SPAN that has been inserted
                    var spanElement = pElementChildNode;
                    new scribe.api.Element(containerPElement).unwrap(spanElement);
                  } else if (pElementChildNode.nodeType === Node.ELEMENT_NODE) {
                    /**
                     * If the paragraph contains inline elements such as
                     * A, B, or I, Chrome will also append an inline style for
                     * `line-height` on those elements, so we remove it here.
                     */
                    pElementChildNode.style.lineHeight = null;

                    // There probably wasn’t a `style` attribute before, so
                    // remove it if it is now empty.
                    if (pElementChildNode.getAttribute('style') === '') {
                      pElementChildNode.removeAttribute('style');
                    }
                  }
                });

                selection.selectMarkers();
              });
            }
          }
        });
      }
    };
  };
});
