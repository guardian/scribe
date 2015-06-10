define([
  './node'
], function (
  nodeHelpers
) {

  function includeRealMutations(mutations) {
    var realChangedNodes = mutations
      .map(function(mutation) {
        return mutations.slice.call(mutation.addedNodes)
          .concat(mutations.slice.call(mutation.removedNodes));
      })
      .reduce(function(result, input) { return result.concat(input); }, [])
      .filter(function(n) { return ! nodeHelpers.isEmptyTextNode(n); })
      .filter(function(n) { return ! nodeHelpers.isSelectionMarkerElement(n); });

    return realChangedNodes.length > 0;
  }

  function observeDomChanges(el, callback) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    // Flag to avoid running recursively
    var runningPostMutation = false;

    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        } catch(e) {
          // The catch block is required but we don't want to swallow the error
          throw e;
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
      childList: true,
      subtree: true
    });

    return observer;
  }

  return observeDomChanges;
});
