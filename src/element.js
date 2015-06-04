define([
  './node'
], function(nodeHelper) {

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
    return (nodeHelper.isElement(element) && element.className === 'scribe-marker');
  }

  function isCaretPositionElement(element) {
    return (nodeHelper.isElement(element) && element.className === 'caret-position');
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerElement: isSelectionMarkerElement,
    isCaretPositionElement: isCaretPositionElement
  };

});
