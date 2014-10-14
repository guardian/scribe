define([
  'scribe-common/src/element'
],
function (elementHelper) {

  'use strict';

  return function (scribe) {
    function Selection() {
      this.selection = window.getSelection();

      if (this.selection.rangeCount) {
        this.range = this.selection.getRangeAt(0);
      }
    }

    Selection.prototype.getContaining = function (nodeFilter) {
      if (!this.range) return;
      var node = new scribe.api.Node(this.range.commonAncestorContainer);
      var isTopContainerElement = node.node && node.node.attributes
         && node.node.attributes.getNamedItem('contenteditable');

      return ! isTopContainerElement && nodeFilter(node.node) ? node.node : node.getAncestor(nodeFilter);
    };

    Selection.prototype.placeMarkers = function () {
      if (!this.range) return;
      if (!scribe.el.contains(this.range.commonAncestorContainer)) return;
      var startMarker = document.createElement('em');
      startMarker.classList.add('scribe-marker');
      var endMarker = document.createElement('em');
      endMarker.classList.add('scribe-marker');

      // End marker
      var rangeEnd = this.range.cloneRange();
      rangeEnd.collapse(false);
      rangeEnd.insertNode(endMarker);

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
       * the inserted element. We just remove it. This in turn creates several
       * bugs when perfoming commands on selections that contain an empty text
       * node (`removeFormat`, `unlink`).
       * As per: http://jsbin.com/hajim/5/edit?js,console,output
       */
      // TODO: abstract into polyfill for `Range.insertNode`
      if (endMarker.nextSibling &&
          endMarker.nextSibling.nodeType === Node.TEXT_NODE
          && endMarker.nextSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.nextSibling);
      }



      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
       * the inserted element when the child element is at the start of a block
       * element. We just remove it.
       * FIXME: Document why we need to remove this
       * As per: http://jsbin.com/sifez/1/edit?js,console,output
       */
      if (endMarker.previousSibling &&
          endMarker.previousSibling.nodeType === Node.TEXT_NODE
          && endMarker.previousSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.previousSibling);
      }


      /**
       * This is meant to test Chrome inserting erroneous text blocks into
       * the scribe el when focus switches from a scribe.el to a button to
       * the scribe.el. However, this is impossible to simlulate correctly
       * in a test.
       *
       * This behaviour does not happen in Firefox.
       *
       * See http://jsbin.com/quhin/2/edit?js,output,console
       *
       * To reproduce the bug, follow the following steps:
       *    1. Select text and create H2
       *    2. Move cursor to front of text.
       *    3. Remove the H2 by clicking the button
       *    4. Observe that you are left with an empty H2
       *        after the element.
       *
       * The problem is caused by the Range being different, depending on
       * the position of the marker.
       *
       * Consider the following two scenarios.
       *
       * A)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click the right of to scribe.el
       *   3. scribe.el contains: ["1", <em>scribe-marker</em>. #text]
       *
       *   This is wrong but does not cause the problem.
       *
       * B)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click to left of scribe.el
       *   3. scribe.el contains: [#text, <em>scribe-marker</em>, "1"]
       *
       * The second example sets the range in the wrong place, meaning
       * that in the second case the formatBlock is executed on the wrong
       * element [the text node] leaving the empty H2 behind.
       **/


      if (! this.selection.isCollapsed) {
        // Start marker
        var rangeStart = this.range.cloneRange();
        rangeStart.collapse(true);
        rangeStart.insertNode(startMarker);

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
         * the inserted element. We just remove it. This in turn creates several
         * bugs when perfoming commands on selections that contain an empty text
         * node (`removeFormat`, `unlink`).
         * As per: http://jsbin.com/hajim/5/edit?js,console,output
         */
        // TODO: abstract into polyfill for `Range.insertNode`
        if (startMarker.nextSibling &&
            startMarker.nextSibling.nodeType === Node.TEXT_NODE
            && startMarker.nextSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.nextSibling);
        }

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node
         * before the inserted element when the child element is at the start of
         * a block element. We just remove it.
         * FIXME: Document why we need to remove this
         * As per: http://jsbin.com/sifez/1/edit?js,console,output
         */
        if (startMarker.previousSibling &&
            startMarker.previousSibling.nodeType === Node.TEXT_NODE
            && startMarker.previousSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.previousSibling);
        }
      }


      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      var markers = this.getMarkers();
      Array.prototype.forEach.call(markers, function (marker) {
        marker.parentNode.removeChild(marker);
      });
    };

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    Selection.prototype.selectMarkers = function (keepMarkers) {
      var markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      var newRange = document.createRange();

      newRange.setStartBefore(markers[0]);
      if (markers.length >= 2) {
        newRange.setEndAfter(markers[1]);
      } else {
        // We always reset the end marker because otherwise it will just
        // use the current range’s end marker.
        newRange.setEndAfter(markers[0]);
      }

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      // return true if nested inline tags ultimately just contain <br> or ""
      function isEmptyInlineElement(node) {

        var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);

        var currentNode = treeWalker.root;

        while(currentNode) {
          var numberOfChildren = currentNode.childNodes.length;

          // forks in the tree or text mean no new line
          if (numberOfChildren > 1 ||
              (numberOfChildren === 1 && currentNode.textContent.trim() !== ''))
            return false;

          if (numberOfChildren === 0) {
            return currentNode.textContent.trim() === '';
          }

          currentNode = treeWalker.nextNode();
        };
      };

      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      if (containerPElement) {
        return isEmptyInlineElement(containerPElement);
      } else {
        return false;
      }
    };

    return Selection;
  };

});
