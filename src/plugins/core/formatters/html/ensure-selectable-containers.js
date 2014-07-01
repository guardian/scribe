define(function () {

  /**
   * Chrome and Firefox: All elements need to contain either
   * text or a `<br>` to remain selectable.
   */

  'use strict';

  var selfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  function traverse(parentNode) {
    // Instead of TreeWalker, which gets confused when the <br> is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    while (node) {
      // Find any node that contains no children
      if (node.childNodes.length === 0 && selfClosingTags.indexOf(node.nodeName) === -1) {
        node.appendChild(document.createElement('br'));
      } else if (node.children.length) {
        traverse(node);
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
