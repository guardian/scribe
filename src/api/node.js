define(function () {

  'use strict';

  function Node(node) {
    this.node = node;
  }

  Node.prototype.getAncestor = function (nodeFilter) {
    // TODO: use do instead?
    while (this.node && this.node.nodeName !== 'body') {
      if (nodeFilter(this.node)) {
        return this.node;
      }
      this.node = this.node.parentNode;
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
