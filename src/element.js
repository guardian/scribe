define(['lodash-amd/modern/collections/contains'], function (contains) {

  'use strict';

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'TH', 'TD',
                           'ASIDE', 'HR'];
  function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
  }

  function isSelectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function isCaretPositionNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'caret-position');
  }

  function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
      node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    isCaretPositionNode: isCaretPositionNode,
    unwrap: unwrap
  };

});
