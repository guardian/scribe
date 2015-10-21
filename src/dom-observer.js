define([
  './node'
], function (nodeHelpers) {

  var MutationObserver;
  // This enables server side rendering
  if (typeof window !== 'undefined') {
    MutationObserver = window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver;
  } else {
    // Stub observe function to escape error
    MutationObserver = function() {
      return {
        observe: function() {}
      };
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

  function observeDomChanges(el, callback) {
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
