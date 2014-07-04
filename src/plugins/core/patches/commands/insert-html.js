define(['../../../../api/element'], function (element) {

  'use strict';

  return function () {
    return function (scribe) {
      var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

      insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          var originalHTML = scribe.el.innerHTML;
          scribe.api.CommandPatch.prototype.execute.call(this, value);
          /**
           * As of IE11, no version of IE supports insertHTML.
           * Recreate insertHTML functionality by inserting a div node,
           * appending a document fragment to that div, and then unwrapping
           * the div. If the insertHTML failed, then fall back to our own
           * implementation of insertHTML.
           */
          if (scribe.el.innerHTML === originalHTML) {
            var selection, range, div, html;
            selection = new scribe.api.Selection();
            range = selection.range;
            range.deleteContents();
            div = scribe.targetWindow.document.createElement('DIV');
            range.insertNode(div);
            html = scribe._htmlFormatterFactory.format(value);
            div.appendChild(range.createContextualFragment(html));
            element.unwrap(div.parentNode, div);
          }

          /**
           * Chrome: If a parent node has a CSS `line-height` when we apply the
           * insertHTML command, Chrome appends a SPAN to plain content with
           * inline styling replicating that `line-height`, and adjusts the
           * `line-height` on inline elements.
           * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
           *
           * FIXME: what if the user actually wants to use SPANs? This could
           * cause conflicts.
           */

          // TODO: share somehow with similar event patch for P nodes
          sanitize(scribe.el);

          function sanitize(parentNode) {
            var treeWalker = scribe.targetWindow.document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT, null, false);
            var node = treeWalker.firstChild();
            if (!node) { return; }

            do {
              if (node.nodeName === 'SPAN') {
                element.unwrap(parentNode, node);
              } else {
                /**
                 * If the list item contains inline elements such as
                 * A, B, or I, Chrome will also append an inline style for
                 * `line-height` on those elements, so we remove it here.
                 */
                node.style.lineHeight = null;

                // There probably wasn’t a `style` attribute before, so
                // remove it if it is now empty.
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
              }

              // Sanitize children
              sanitize(node);
            } while ((node = treeWalker.nextSibling()));
          }
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };

});
