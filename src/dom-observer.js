define([
  'lodash-amd/modern/arrays/flatten',
  'lodash-amd/modern/collections/toArray',
  'scribe-common/src/element',
  'scribe-common/src/node'
], function (
  flatten,
  toArray,
  elementHelpers,
  nodeHelpers
) {

  function observeDomChanges(el, callback) {
    function includeRealMutations(mutations) {
      var allChangedNodes = flatten(mutations.map(function(mutation) {
        var added   = toArray(mutation.addedNodes);
        var removed = toArray(mutation.removedNodes);
        return added.concat(removed);
      }));

      var realChangedNodes = allChangedNodes.
        filter(function(n) { return ! nodeHelpers.isEmptyTextNode(n); }).
        filter(function(n) { return ! elementHelpers.isSelectionMarkerNode(n); });

      return realChangedNodes.length > 0;
    }

    // Flag to avoid running recursively
    var runningPostMutation = false;
    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        }
        catch(e){
          //we need at least an empty catch to catch any errors
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
