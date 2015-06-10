define(function () {

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

  /**
   * Wrap consecutive inline elements and text nodes in a P element.
   */
  function wrapChildNodes(scribe, parentNode) {
    var groups = Array.prototype.reduce.call(
      parentNode.childNodes,
      function (accumulator, binChildNode) {
        var group = accumulator.pop();
        if ( scribe.node.isBlockElement(binChildNode) ) {
          if ( group !== undefined && !! group.length ) {
            accumulator.push(group);
            accumulator.push([]);
          }
        } else {
          if ( group === undefined ) {
            accumulator.push([binChildNode]);
          } else {
            group.push(binChildNode);
            accumulator.push(group);
          }
        }

      return accumulator;
    }, []);

    groups.forEach(function (nodes) {
      scribe.node.wrap(nodes, document.createElement('p'));
    });

    parentNode._isWrapped = true;
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(scribe, parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT, null, false);
    var node = treeWalker.firstChild();

    // FIXME: does this recurse down?

    while (node) {
      // TODO: At the moment we only support BLOCKQUOTEs. See failing
      // tests.
      if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
        wrapChildNodes(scribe, node);
        traverse(scribe, parentNode);
        break;
      }
      node = treeWalker.nextSibling();
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
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

        wrapChildNodes(scribe, bin);
        traverse(scribe, bin);

        return bin.innerHTML;
      });

    };
  };

});
