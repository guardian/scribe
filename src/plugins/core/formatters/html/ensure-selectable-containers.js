define(['scribe-common/element'], function (element) {

  /**
   * Chrome and Firefox: All elements need to contain either
   * text or a `<br>` to remain selectable.
   */

  'use strict';

  var selfClosingTags = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

  function traverse(parentNode) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    while (node) {
      if (!element.isSelectionMarkerNode(node)) {
        // Find any node that contains no children, or just contains whitespace
        if ((node.childNodes.length === 0 || node.textContent.trim() === '') &&
          node.children.length === 0 &&
          selfClosingTags.indexOf(node.nodeName) === -1) {
          node.appendChild(document.createElement('br'));
        } else if (node.children.length > 0) {
          traverse(node);
        }
      }
      node = node.nextElementSibling;
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});
