define([
  'immutable/dist/immutable'
], function (Immutable) {

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
    var index = 0;
    Immutable.List(parentNode.childNodes)
      .filter(function(node) {
        return scribe.node.isText(node) || !scribe.node.isBlockElement(node);
      })
      .groupBy(function(node, key, list) {
        return key === 0 || node.previousSibling === list.get(key - 1) ?
          index :
          ++index;
      })
      .forEach(function(nodeGroup) {
        scribe.node.wrap(nodeGroup.toArray(), document.createElement('p'));
      });
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(scribe, parentNode) {
    var i = -1, len = parentNode.children.length;

    while (node = parentNode.children[++i]) {
      if( node.tagName === 'BLOCKQUOTE' ) {
        wrapChildNodes(scribe, node);
      }
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
