define([
  './node'
], function (nodeHelpers) {

  'use strict';

  var blockElementNames = ['ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD',
                           'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
                           'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD',
                           'TH', 'TFOOT', 'UL', 'VIDEO'];

  function isBlockElement(element) {
    return blockElementNames.indexOf(element.nodeName) !== -1;
  }

  function isSelectionMarkerElement(element) {
    return (nodeHelpers.isElement(element) && element.className === 'scribe-marker');
  }

  function isCaretPositionElement(element) {
    return (nodeHelpers.isElement(element) && element.className === 'caret-position');
  }

  function unwrap(node) {
    while (!!node.childNodes.length) {
      node.parentNode.insertBefore(node.childNodes[0], node);
    }
    nodeHelpers.removeNode(node);
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerElement: isSelectionMarkerElement,
    isCaretPositionElement: isCaretPositionElement,
    unwrap: unwrap
  };

});
