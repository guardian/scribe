define([], function () {
  "use strict";
  return function () {
    return function (scribe) {
      var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
      var nodeHelper = scribe.node;

      insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          // TODO: share somehow with similar event patch for P nodes
          removeChromeArtifacts(scribe.el);

          /**
           * Chrome: If a parent node has a CSS `line-height` when we apply the
           * insertHTML command, Chrome appends a SPAN to plain content with
           * inline styling replicating that `line-height`, and adjusts the
           * `line-height` on inline elements.
           *
           * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
           * More from the web: http://stackoverflow.com/q/15015019/40352
           */
          function removeChromeArtifacts(parentElement) {
            // Can't use treeWalker: In at least Chrome, if a node is unwrapped,
            // treeWalker.nextSibling will not work properly after that.
            var childElement = parentElement.firstElementChild;
            while (childElement) {
              /**
               * If the list item contains inline elements such as
               * A, B, or I, Chrome will also append an inline style for
               * `line-height` on those elements, so we remove it here.
               */
              var childStyle = window.getComputedStyle(childElement);
              if ((childStyle.display === 'inline' || childElement.nodeName === 'SPAN') && window.getComputedStyle(parentElement)['line-height'] === childStyle['line-height']) {
                childElement.style.lineHeight = null;
              }

              // We can discard an empty style attribute.
              if (childElement.getAttribute('style') === '') {
                childElement.removeAttribute('style');
              }

              // Sanitize children.
              removeChromeArtifacts(childElement);

              // We can discard an empty SPAN.
              // (Don't do this until traversal's gone to the next element.)
              var originalChild = childElement;
              childElement = childElement.nextElementSibling;
              if (originalChild.nodeName === 'SPAN' && originalChild.attributes.length === 0) {
                nodeHelper.unwrap(originalChild);
              }
            }
          }
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };

});
