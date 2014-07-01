define([
  'mutation-summary',
  '../../../api/element'
], function (
  MutationSummary,
  element
) {
  'use strict';
  return function () {

    return function (scribe) {

      var selection = new scribe.api.Selection();

      function onPElementMutation (mutations) {
        mutations.forEach(function (summary) {
          // We want only "remove" mutations
          summary.removed.forEach(function (el) {

            // If removed element was the last one we have to recreate it again
            if (wasLastParagraph()) {
              removeMozBrElements();
              recreateEmptyPElement();
            };

            // Wrap non-empty text nodes in P
            Array.prototype.forEach.call(scribe.el.childNodes, function (node) {
              // Wrap empty text nodes in paragraphs
              if (node.nodeType === Node.TEXT_NODE && node.data.trim().length) {
                wrapTextNodeInParagraph(node);
              // Remove parentless BRs
              } else if (node.nodeName == 'BR') {
                node.remove();
              };
            });
          });
        });
      };

      function recreateEmptyPElement () {
        var pElement = element.createEmptyPElement();
        scribe.el.appendChild(pElement);

        var newRange = document.createRange();
        newRange.setStartBefore(pElement.firstChild);
        selection.selection.removeAllRanges();
        selection.selection.addRange(newRange);
      };

      function removeMozBrElements () {
        var brElements = scribe.el.querySelectorAll('br[type="_moz"]');
        Array.prototype.forEach.call(brElements, function (br) {
          br.remove();
        });
      };

      function wrapTextNodeInParagraph(node) {
        var pElement = element.createEmptyPElement();
        pElement.textContent = node.data;
        scribe.el.replaceChild(pElement, node);

      };

      function wasLastParagraph () {
        return !scribe.el.getElementsByTagName('p').length;
      };

      new MutationSummary({
        callback: onPElementMutation,
        rootNode: scribe.el,
        queries: [{ element: 'p' }]
      });
    };
  };
});