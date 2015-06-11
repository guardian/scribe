define(function () {

  'use strict';

  function Node(node) {
    this.node = node;
  }

  // TODO: should the return value be wrapped in one of our APIs?
  // Node or Selection?
  // TODO: write tests. unit or integration?
  Node.prototype.getAncestor = function (rootElement, nodeFilter) {
    // TODO: should this happen here?
    if (this.node === rootElement) {
      return;
    }

    var currentNode = this.node;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while ((currentNode = currentNode.parentNode) && currentNode !== rootElement) {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
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
