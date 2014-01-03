define([
  './node'
], function (
  Node
) {

  'use strict';

  function Selection() {
    this.selection = window.getSelection();

    if (this.selection.rangeCount) {
      this.range = this.selection.getRangeAt(0);
    } else {
      this.range = new window.Range();
    }
  }

  Selection.prototype.getContaining = function (nodeFilter) {
    var node = new Node(this.range.commonAncestorContainer);
    return node.getAncestor(nodeFilter);
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

    if (!this.range.collapsed) {
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

  Selection.prototype.getMarkers = function (editorNode) {
    return editorNode.querySelectorAll('em.scribe-marker');
  };

  Selection.prototype.removeMarkers = function (editorNode) {
    var markers = this.getMarkers(editorNode);
    Array.prototype.forEach.call(markers, function (marker) {
      marker.parentNode.removeChild(marker);
    });
  };

  // TODO: use range for editorNode?
  Selection.prototype.selectMarkers = function (editorNode, keepMarkers) {
    var markers = this.getMarkers(editorNode);
    if (!markers.length) {
      return;
    }

    this.range.setStartBefore(markers[0]);
    if (markers.length >= 2) {
      this.range.setEndAfter(markers[1]);
    }

    if (! keepMarkers) {
      this.removeMarkers(editorNode);
    }

    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
  };

  return Selection;

});
