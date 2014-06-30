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
          });
        });
      }

      function recreateEmptyPElement () {
        var pElement = element.createEmptyPElement();
        scribe.el.appendChild(pElement);

        var newRange = document.createRange();
        newRange.setStartBefore(pElement.firstChild);
        selection.selection.removeAllRanges();
        selection.selection.addRange(newRange);
      }

      function removeMozBrElements () {
        Array.prototype.forEach.call(scribe.el.querySelectorAll('br[type="_moz"]'), function (br) {
          br.remove();
        });
      }

      function wasLastParagraph () {
        return !scribe.el.getElementsByTagName('p').length;
      }

      new MutationSummary({
        callback: onPElementMutation,
        rootNode: scribe.el,
        queries: [{ element: 'p' }]
      });
    };
  };
});