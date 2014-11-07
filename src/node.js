define([], function () {

  'use strict';

  function isEmptyTextNode(node) {
    return (node.nodeType === Node.TEXT_NODE && node.textContent === '');
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  return {
    isEmptyTextNode: isEmptyTextNode,
    insertAfter: insertAfter,
    removeNode: removeNode
  };

});
