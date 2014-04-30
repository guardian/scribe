define(function () {

  'use strict';

  return function (scribe) {
    function Selection() {
      this.selection = window.getSelection();

      if (this.selection.rangeCount) {
        this.range = this.selection.getRangeAt(0);
      }
    }

    Selection.prototype.getContaining = function (nodeFilter) {
      var node = new scribe.api.Node(this.range.commonAncestorContainer);
      var isTopContainerElement = node.node && node.node.attributes
        && node.node.attributes.getNamedItem('contenteditable');
      return ! isTopContainerElement && nodeFilter(node.node) ? node.node : node.getAncestor(nodeFilter);
    };

    Selection.prototype.placeMarkers = function () {
      var startMarker = document.createElement('em');
      startMarker.classList.add('scribe-marker');
      var endMarker = document.createElement('em');
      endMarker.classList.add('scribe-marker');

      // End marker
      var rangeEnd = this.range.cloneRange();
      rangeEnd.collapse(false);
      rangeEnd.insertNode(endMarker);

      /**
       * Chrome: `Range.insertNode` inserts a bogus text node after the inserted
       * element. We just remove it.
       * As per: http://jsbin.com/ODapifEb/1/edit?js,console,output
       */
      // TODO: abstract into polyfill for `Range.insertNode`
      if (endMarker.nextSibling && endMarker.nextSibling.nodeType === 3 && endMarker.nextSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.nextSibling);
      }

      if (!this.isCollapsed) {
        // Start marker
        var rangeStart = this.range.cloneRange();
        rangeStart.collapse(true);
        rangeStart.insertNode(startMarker);

        /**
         * Chrome: `Range.insertNode` inserts a bogus text node after the inserted
         * element. We just remove it.
         * As per: http://jsbin.com/ODapifEb/1/edit?js,console,output
         */
        // TODO: abstract into polyfill for `Range.insertNode`
        if (startMarker.nextSibling && startMarker.nextSibling.nodeType === 3 && startMarker.nextSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.nextSibling);
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
      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      // We must do `innerHTML.trim()` to avoid weird Firefox bug:
      // http://stackoverflow.com/questions/3676927/why-if-element-innerhtml-is-not-working-in-firefox
      if (containerPElement) {
        var containerPElementInnerHTML = containerPElement.innerHTML.trim();
        return (containerPElement.nodeName === 'P'
                && (containerPElementInnerHTML === '<br>'
                    || containerPElementInnerHTML === ''));
      } else {
        return false;
      }
    };

    return Selection;
  };

});
