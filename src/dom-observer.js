define([
  'lodash-amd/modern/arrays/flatten',
  'lodash-amd/modern/collections/toArray'
], function (
  flatten,
  toArray
) {

  function observeDomChanges(el, callback) {
    function notEmptyTextNode(node) {
      return ! (node.nodeType === Node.TEXT_NODE && node.textContent === '');
    }

    function notSelectionMarkerNode(node) {
      return ! (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
    }

    function includeRealMutations(mutations) {
      var allChangedNodes = flatten(mutations.map(function(mutation) {
        var added   = toArray(mutation.addedNodes);
        var removed = toArray(mutation.removedNodes);
        return added.concat(removed);
      }));

      var realChangedNodes = allChangedNodes.
        filter(notEmptyTextNode).
        filter(notSelectionMarkerNode);

      return realChangedNodes.length > 0;
    }


    // Flag to avoid running recursively
    var runningPostMutation = false;
    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        } finally {
          // We must yield to let any mutation we caused be triggered
          // in the next cycle
          setTimeout(function() {
            runningPostMutation = false;
          }, 0);
        }
      }
    });

    observer.observe(el, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return observer;
  }

  return observeDomChanges;
});
