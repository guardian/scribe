define([
  'lodash-modern/arrays/last'
], function (
  last
) {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the
   * browser deletes the paragraph element, leaving the caret (and any
   * content) outside of any P.
   *
   * Firefox: Erasing across multiple paragraphs, or outside of a
   * whole paragraph (e.g. by ‘Select All’) will leave content outside
   * of any P.
   *
   * Entering a new line in a pristine state state will insert
   * `<div>`s (in Chrome) or `<br>`s (in Firefox) where previously we
   * had `<p>`'s. This patches the behaviour of delete/backspace so
   * that we do not end up in a pristine state.
   */

  'use strict';


  return function () {
    return function (scribe) {
      /**
       * Wrap consecutive inline elements and text nodes in a P element.
       */
      function wrapChildNodes(parentNode) {
        var groups = Array.prototype.reduce.call(parentNode.childNodes,
                                                 function (accumulator, binChildNode) {
          var group = last(accumulator);
          if (! group) {
            startNewGroup();
          } else {
            var isBlockGroup = scribe.api.element.isBlockElement(group[0]);
            if (isBlockGroup === scribe.api.element.isBlockElement(binChildNode)) {
              group.push(binChildNode);
            } else {
              startNewGroup();
            }
          }

          return accumulator;

          function startNewGroup() {
            var newGroup = [binChildNode];
            accumulator.push(newGroup);
          }
        }, []);

        var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
          var isBlockGroup = scribe.api.element.isBlockElement(group[0]);
          return ! isBlockGroup;
        });

        consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
          var pElement = document.createElement('p');
          nodes[0].parentNode.insertBefore(pElement, nodes[0]);
          nodes.forEach(function (node) {
            pElement.appendChild(node);
          });
        });

        parentNode._isWrapped = true;
      }

      // Traverse the tree, wrapping child nodes as we go.
      function traverse(parentNode) {
        var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
        var node = treeWalker.firstChild();

        // FIXME: does this recurse down?

        while (node) {
          // TODO: At the moment we only support BLOCKQUOTEs. See failing
          // tests.
          if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
            wrapChildNodes(node);
            traverse(parentNode);
            break;
          }
          node = treeWalker.nextSibling();
        }
      }

      scribe.htmlFormatter.formatters.normalize.push(function (html) {
        /**
         * Ensure P mode.
         *
         * Wrap any orphan text nodes in a P element.
         */
        // TODO: This should be configurable and also correct markup such as
        // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
        // TODO: This should probably be a part of HTML Janitor, or some other
        // formatter.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        wrapChildNodes(bin);
        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});
