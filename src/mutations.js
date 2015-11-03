define([], function() {

  function determineMutationObserver(window) {
    // This enables server side rendering
    if (typeof window === 'undefined') {
      // Stub observe function to avoid error
      return function() {
        return {
          observe: function() {}
        };
      }
    } else {
      return window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;
    }
  }

  function hasRealMutation(n) {
    return ! nodeHelpers.isEmptyTextNode(n) &&
      ! nodeHelpers.isSelectionMarkerNode(n);
  }

  function includeRealMutations(mutations) {
    return mutations.some(function(mutation) {
      return Array.prototype.some.call(mutation.addedNodes, hasRealMutation) ||
        Array.prototype.some.call(mutation.removedNodes, hasRealMutation);
    });
  }

  return {
    determineMutationObserver: determineMutationObserver,
    hasRealMutation: hasRealMutation,
    includeRealMutations: includeRealMutations
  };
});
