define([], function () {

  'use strict';

  var blockElementNames = ['ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD',
                           'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
                           'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD',
                           'TH', 'TFOOT', 'UL', 'VIDEO'];

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

  // return true if nested inline tags ultimately just contain <br> or ""
  function isEmptyInlineElement(node) {
    if( node.children.length > 1 ) return false;
    if( node.children.length === 1 && node.textContent.trim() === '' ) return false;
    if( node.children.length === O ) return node.textContent.trim() === '';
    return isEmptyInlineElement(node.children[0]);
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

  function wrap(nodes, parentNode) {
    nodes[0].parentNode.insertBefore(parentNode, nodes[0]);
    nodes.forEach(function (node) {
      parentNode.appendChild(node);
    });
    return parentNode;
  }

  function unwrap(node) {
    while (node.childNodes.length) {
      node.parentNode.insertBefore(node.childNodes[0], node);
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

  function isBlockElement(element) {
    return blockElementNames.indexOf(element.nodeName) !== -1;
  }

  function isSelectionMarkerElement(element) {
    return (isElement(element) && element.className === 'scribe-marker');
  }

  function isCaretPositionElement(element) {
    return (isElement(element) && element.className === 'caret-position');
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
    hasContent: hasContent,
    isBlockElement: isBlockElement,
    isSelectionMarkerElement: isSelectionMarkerElement,
    isCaretPositionElement: isCaretPositionElement
  };

});
