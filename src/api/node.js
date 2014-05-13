define(function () {

  'use strict';

  function Node(node) {
    this.node = node;
  }

  // TODO: should the return value be wrapped in one of our APIs?
  // Node or Selection?
  // TODO: write tests. unit or integration?
  Node.prototype.getAncestor = function (nodeFilter) {
    var isTopContainerElement = function (element) {
      return element && element.attributes
        && element.attributes.getNamedItem('contenteditable');
    };
    // TODO: should this happen here?
    if (isTopContainerElement(this.node)) {
      return;
    }

    var currentNode = this.node.parentNode;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while (currentNode && ! isTopContainerElement(currentNode)) {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
  };

  Node.prototype.nextAll = function () {
    var all = [];
    var el = this.node.nextSibling;
    while (el) {
      all.push(el);
      el = el.nextSibling;
    }
    return all;
  };

  return Node;

});
