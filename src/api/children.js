define(function () {

  'use strict';

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

  return {
    firstDeepestChild: firstDeepestChild
  }
});
