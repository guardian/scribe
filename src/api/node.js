define(function () {

  'use strict';

  function Node(node) {
    this.node = node;
  }

  Node.prototype.getAncestor = function (nodeFilter) {
    // TODO: use do instead?
    // TODO: don't change *this* node object when traversing!
    while (this.node) {
      if (nodeFilter(this.node)) {
        return this.node;
      }
      this.node = this.node.parentNode;
      // If it's a `contenteditable` then it's likely going to be the Scribe
      // instance, so stop traversing there.
      if (this.node && this.node.attributes && this.node.attributes.getNamedItem('contenteditable')) {
        delete this.node;
        return;
      }
    }
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
