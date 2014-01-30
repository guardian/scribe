define(['./node'], function (Node) {

  'use strict';

  function Element(node) {
    Node.call(this, node);
  }

  Element.prototype = Object.create(Node.prototype);
  Element.prototype.constructor = Element;

  Element.prototype.unwrap = function () {
    while (this.node.childNodes.length > 0) {
      this.node.parentNode.insertBefore(this.node.childNodes[0], this.node);
    }
    this.node.parentNode.removeChild(this.node);
  };

  return Element;

});
