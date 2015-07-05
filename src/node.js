define([
  'immutable'
], function (Immutable) {

  'use strict';

  var blockElementNames = Immutable.Set.of('ADDRESS', 'ARTICLE', 'ASIDE', 'AUDIO', 'BLOCKQUOTE', 'CANVAS', 'DD',
                           'DIV', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI',
                           'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD',
                           'TH', 'TFOOT', 'UL', 'VIDEO');

  function isBlockElement(node) {
    return blockElementNames.includes(node.nodeName);
  }

  // return true if nested inline tags ultimately just contain <br> or ""
  function isEmptyInlineElement(node) {
    if( node.children.length > 1 ) return false;
    if( node.children.length === 1 && node.textContent.trim() !== '' ) return false;
    if( node.children.length === 0 ) return node.textContent.trim() === '';
    return isEmptyInlineElement(node.children[0]);
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

  function isSelectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function isCaretPositionNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'caret-position');
  }

  function firstDeepestChild(node) {
    var fs = node.firstChild;
    return !fs || fs.nodeName === 'BR' ?
      node :
      firstDeepestChild(fs);
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  function getAncestor(node, rootElement, nodeFilter) {
    function isTopContainerElement (element) {
      return rootElement === element;
    }
    // TODO: should this happen here?
    if (isTopContainerElement(node)) {
      return;
    }

    var currentNode = node.parentNode;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while (currentNode && ! isTopContainerElement(currentNode)) {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
  }

  function nextSiblings(node) {
    var all = Immutable.List();
    while (node = node.nextSibling) {
      all = all.push(node);
    }
    return all;
  }

  function wrap(nodes, parentNode) {
    nodes[0].parentNode.insertBefore(parentNode, nodes[0]);
    nodes.forEach(function (node) {
      parentNode.appendChild(node);
    });
    return parentNode;
  }

  function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
      node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
  }

  /**
   * Chrome: If a parent node has a CSS `line-height` when we apply the
   * insertHTML command, Chrome appends a SPAN to plain content with
   * inline styling replicating that `line-height`, and adjusts the
   * `line-height` on inline elements.
   *
   * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
   * More from the web: http://stackoverflow.com/q/15015019/40352
   */
  function removeChromeArtifacts(parentElement) {
    function isInlineWitStyle(parentStyle, element) {
      return isInlineElement(element) &&
        element.style.lineHeight === parentStyle.lineHeight ?
        NodeFilter.FILTER_ACCEPT :
        NodeFilter.FILTER_SKIP;
    }

    var iterator = document.createNodeIterator(
      parentElement,
      NodeFilter.SHOW_ELEMENT,
      // arguments to .bind(), starting from the second, are automatically
      // prepended to actual the arguments when the function is called
      isInlineWitStyle.bind(null, window.getComputedStyle(parentElement))
    );
    var emptySpans = Immutable.List();
    var node;

    while (node = iterator.nextNode()) {
      node.style.lineHeight = null;
      if (node.getAttribute('style') === '') {
        node.removeAttribute('style');
      }
      if (node.nodeName === 'SPAN' && node.attributes.length === 0) {
        emptySpans = emptySpans.push(node);
      }
    }

    while (!!emptySpans.size) {
      unwrap(parentElement, emptySpans.first());
      emptySpans = emptySpans.shift();
    }
  }

  return {
    isBlockElement: isBlockElement,
    isEmptyInlineElement: isEmptyInlineElement,
    isText: isText,
    isEmptyTextNode: isEmptyTextNode,
    isFragment: isFragment,
    isBefore: isBefore,
    isSelectionMarkerNode: isSelectionMarkerNode,
    isCaretPositionNode: isCaretPositionNode,
    firstDeepestChild: firstDeepestChild,
    insertAfter: insertAfter,
    removeNode: removeNode,
    getAncestor: getAncestor,
    nextSiblings: nextSiblings,
    wrap: wrap,
    unwrap: unwrap,
    removeChromeArtifacts: removeChromeArtifacts
  };

});
