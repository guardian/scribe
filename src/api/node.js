define([
  '../api'
], function (
  api
) {

  'use strict';

  api.Node = function (node) {
    this.node = node;
  };

  api.Node.prototype.getAncestor = function (nodeFilter) {
    // TODO: use do instead?
    while (this.node && this.node.nodeName !== 'body') {
      if (nodeFilter(this.node)) {
        return this.node;
      }
      this.node = this.node.parentNode;
    }
  };

  return api;

});
