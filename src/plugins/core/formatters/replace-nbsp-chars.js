define(function () {

  /**
   * Chrome:
   */

  'use strict';

  return function () {
    return function (scribe) {
      scribe.formatter.formatters.push(function (html) {
        var binElement = document.createElement('div');
        binElement.innerHTML = html;

        replaceNbspChars(binElement);

        return binElement.innerHTML;

        function replaceNbspChars(parentNode) {
          var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_TEXT);
          var node = treeWalker.firstChild();
          if (node) {
            do {
              var nbspChar = '\xA0';
              node.textContent = node.textContent.replace(new RegExp(nbspChar, 'g'), ' ');

              // Sanitize children
              replaceNbspChars(node);
              node = treeWalker.nextSibling();
            } while (node);
          }
        }
      });
    };
  };

});
