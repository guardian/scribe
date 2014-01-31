define(['./node'], function (Node) {

  'use strict';

  function Element(node) {
    Node.call(this, node);
  }

  Element.prototype = Object.create(Node.prototype);
  Element.prototype.constructor = Element;

  Element.prototype.unwrap = function (childNode) {
    while (childNode.childNodes.length > 0) {
      this.node.insertBefore(childNode.childNodes[0], childNode);
    }
    this.node.removeChild(childNode);
  };

  return Element;

});
