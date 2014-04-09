define([
  'lodash-modern/arrays/last',
  'lodash-modern/arrays/flatten',
  'lodash-modern/collections/contains'
], function (
  last,
  flatten,
  contains
) {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the browser
   * deletes the paragraph element, leaving the scribe in a pristine state.
   *
   * Firefox: Erasing the range created by ‘Select All’ will leave the scribe
   * in a pristine state.
   *
   * Entering a new line in a pristine state state will insert `<div>`s where
   * previously we had `<p>`'s. This patches the behaivour of delete/backspace
   * so that we do not end up in a pristine state.
   */

  'use strict';


  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H2'];
  function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
  }

  /**
   * Wrap consecutive inline elements and text nodes in a P element.
   */
  function wrapChildNodes(parentNode) {
    var groups = Array.prototype.reduce.call(parentNode.childNodes,
                                             function (accumulator, binChildNode) {
      var group = last(accumulator);
      if (! group) {
        startNewGroup();
      } else {
        var isBlockGroup = isBlockElement(group[0]);
        if (isBlockGroup === isBlockElement(binChildNode)) {
          group.push(binChildNode);
        } else {
          startNewGroup();
        }
      }

      return accumulator;

      function startNewGroup() {
        var newGroup = [binChildNode];
        accumulator.push(newGroup);
      }
    }, []);

    var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
      var isBlockGroup = isBlockElement(group[0]);
      return ! isBlockGroup;
    });

    consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
      var pElement = document.createElement('p');
      nodes[0].parentNode.insertBefore(pElement, nodes[0]);
      nodes.forEach(function (node) {
        pElement.appendChild(node);
      });
    });

    parentNode._isWrapped = true;
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
    var node = treeWalker.firstChild();

    while (node) {
      // TODO: At the moment we only support BLOCKQUOTEs. See failing
      // tests.
      if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
        wrapChildNodes(node);
        traverse(parentNode);
        break;
      }
      node = treeWalker.nextSibling();
    }
  }


  return function () {
    return function (scribe) {

      scribe.htmlFormatter.formatters.push(function (html) {
        /**
         * Ensure P mode.
         *
         * Wrap any orphan text nodes in a P element.
         */
        // TODO: This should be configurable and also correct markup such as
        // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
        // TODO: This should probably be a part of HTML Janitor, or some other
        // formatter.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        wrapChildNodes(bin);
        traverse(bin);

        // FIXME: non-P stuff?

        return bin.innerHTML;
      });



      function notEmptyTextNode(node) {
        return ! (node.nodeType === Node.TEXT_NODE && node.textContent === '');
      }

      function notSelectionMarkerNode(node) {
        return ! (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
      }

      function includeRealMutations(mutations) {
        var allChangedNodes = flatten(mutations.map(function(mutation) {
          var added = Array.prototype.slice.call(mutation.addedNodes);
          var removed = Array.prototype.slice.call(mutation.removedNodes);
          return added.concat(removed);
        }));

        var realChangedNodes = allChangedNodes.
              filter(notEmptyTextNode).
              filter(notSelectionMarkerNode);

        return realChangedNodes.length > 0;
      }


      function applyFormatters() {
        // Discard the last history item, as we're going to be adding
        // a new clean history item next.
        scribe.undoManager.undo();

// FIXME: caret position after undo?

        scribe.transactionManager.run(function () {
          var selection = new scribe.api.Selection();
          selection.placeMarkers()
          // scribe.setContent(scribe.getHTML())
          scribe.setHTML(scribe.htmlFormatter.format(scribe.getHTML()))
          selection.selectMarkers()
        });
      }

      var runningPostMutation = false;
      var observer = new MutationObserver(function(mutations) {
        if (! runningPostMutation && includeRealMutations(mutations)) {
          runningPostMutation = true;

          applyFormatters()

          // We must yield to let any mutation we caused be triggered
          // in the next cycle
          setTimeout(function() {
            runningPostMutation = false;
          }, 0);
        }
      });

      observer.observe(scribe.el, {
        attributes: true,
        childList: true,
        subtree: true
      });

// FIXME: tear down?
      // later, you can stop observing
      // observer.disconnect();
    };
  };

});
