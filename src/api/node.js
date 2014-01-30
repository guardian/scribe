define(function () {

  'use strict';

  function Node(node) {
    this.node = node;
  }

  Node.prototype.getAncestor = function (nodeFilter) {
    var currentNode = this.node;
    do {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
      // If it's a `contenteditable` then it's likely going to be the Scribe
      // instance, so stop traversing there.
      if (currentNode && currentNode.attributes && currentNode.attributes.getNamedItem('contenteditable')) {
        currentNode = null;
        return;
      }
    } while (currentNode);
  };

  Node.prototype.nextAll = function () {
    var all = [];
    var el = this.node;
    while (el = el.nextElementSibling) {
      all.push(el);
    }
    return all;
  };

  return Node;

});
