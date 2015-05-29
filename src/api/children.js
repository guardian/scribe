define(function () {

  'use strict';
        function getFirstDeepestChild(node) {
          var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ALL, null, false);
          var previousNode = treeWalker.currentNode;
          if (treeWalker.firstChild()) {
            // TODO: build list of non-empty elements (used elsewhere)
            // Do not include non-empty elements
            if (treeWalker.currentNode.nodeName === 'BR') {
              return previousNode;
            } else {
              return getFirstDeepestChild(treeWalker.currentNode);
            }
          } else {
            return treeWalker.currentNode;
          }
        }

  return {
    getFirstDeepestChild: getFirstDeepestChild
  }
});
