define(['immutable'], function (Immutable) {

  'use strict';

  var blockElementNames = Immutable.Set.of('ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD',
                           'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
                           'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD',
                           'TH', 'TFOOT', 'UL', 'VIDEO');

  // Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elemente
  var inlineElementNames = Immutable.Set.of('B', 'BIG', 'I', 'SMALL', 'TT',
    'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 'EM', 'KBD', 'STRONG', 'SAMP', 'VAR',
    'A', 'BDO', 'BR', 'IMG', 'MAP', 'OBJECT', 'Q', 'SCRIPT', 'SPAN', 'SUB', 'SUP',
    'BUTTON', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA');

  function isBlockElement(node) {
    return blockElementNames.includes(node.nodeName);
  }

  function isInlineElement(node) {
    return inlineElementNames.includes(node.nodeName);
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
    isInlineElement: isInlineElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    isCaretPositionNode: isCaretPositionNode,
    unwrap: unwrap
  };

});
