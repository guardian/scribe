define([], function () {

  'use strict';

  function getAncestor(node, nodeFilter, rootNode) {
    rootNode = rootNode || node.ownerDocument;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while ((node = node.parentNode) && node !== rootNode) {
      if (nodeFilter(node)) {
        return node;
      }
    }

    return null;
  }

  function nextAll(node) {
    var all = [];
    while (node = node.nextSibling) {
      all.push(node);
    }
    return all;
  }


  function firstDeepestChild(node) {
    if(!node.hasChildNodes()) {
      return node;
    }

    var child = node.firstChild;
    if( child.nodeName === 'BR' ) {
      return node;
    }

    return firstDeepestChild(child);
  }

  function unwrap(node) {
    while (node.childNodes.length) {
      node.insertBefore(node.childNodes[0], node);
    }
    removeNode(node);
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  function isElement(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }

  function isText(node) {
    return node.nodeType === Node.TEXT_NODE;
  }

  function isEmptyTextNode(node) {
    return isText(node) && node.data === '';
  }

  function isFragment(node) {
    return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
  }

  function isBefore(node1, node2) {
    return node1.compareDocumentPosition(node2) & Node.DOCUMENT_POSITION_FOLLOWING;
  }

  function hasContent(node) {
    var treeWalker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      { acceptNode: function(node) { return node.nodeName === 'BR' || ! isEmptyTextNode(node) } },
      false
    );

    return treeWalker.nextNode();
  }

  return {
    getAncestor: getAncestor,
    nextAll: nextAll,
    firstDeepestChild: firstDeepestChild,
    insertAfter: insertAfter,
    removeNode: removeNode,
    unwrap: unwrap,
    isEmptyTextNode: isEmptyTextNode,
    isElement: isElement,
    isText: isText,
    isFragment: isFragment,
    isBefore: isBefore,
    hasContent: hasContent
  };

});
