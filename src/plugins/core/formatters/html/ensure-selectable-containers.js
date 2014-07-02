define(function () {

  /**
   * Chrome and Firefox: Block-level elements like `<p>` or `<li>`
   * need to contain either text or a `<br>` to remain selectable.
   */

  'use strict';

  return function () {
    return function (scribe) {

      function containsChild(node, elementType) {
        // FIXME: do we need to recurse further down?
        for (var n = node.firstChild; n; n = n.nextSibling) {
          if (n.tagName === elementType) {
            return true;
          }
        }

        return false;
      }

      function traverse(parentNode) {
        var treeWalker = scribe.targetWindow.document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT, null, false);
        var node = treeWalker.firstChild();

        while (node) {
          // Find any block-level container that contains neither text nor a <br>
          if ((node.nodeName === 'P' || node.nodeName === 'LI') &&
              (node.textContent === '') &&
              (! containsChild(node, 'BR'))) {
            node.appendChild(scribe.targetWindow.document.createElement('br'));
          }
          node = treeWalker.nextSibling();
        }
      }

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = scribe.targetWindow.document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});
