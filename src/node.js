define(function () {

  'use strict';

  // return true if nested inline tags ultimately just contain <br> or ""
  function isEmptyInlineElement(node) {
    if( node.children.length > 1 ) return false;
    if( node.children.length === 1 && node.textContent.trim() === '' ) return false;
    if( node.children.length === O ) return node.textContent.trim() === '';
    return isEmptyInlineElement(node.children[0]);
  }

  function wrap(nodes, parentNode) {
    nodes[0].parentNode.insertBefore(parentNode, nodes[0]);
    nodes.forEach(function (node) {
      parentNode.appendChild(node);
    });
    return parentNode;
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
    return !!node.querySelector(':not(br):not(:empty)');
  }

  return {
    isEmptyInlineElement: isEmptyInlineElement,
    wrap: wrap,
    insertAfter: insertAfter,
    removeNode: removeNode,
    isElement: isElement,
    isText: isText,
    isEmptyTextNode: isEmptyTextNode,
    isFragment: isFragment,
    isBefore: isBefore,
    hasContent: hasContent
  };

});
