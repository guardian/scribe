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
    }
  }

  Selection.prototype.getContaining = function (nodeFilter) {
    var node = new Node(this.range.commonAncestorContainer);
    return node.getAncestor(nodeFilter);
  };

  Selection.prototype.placeMarkers = function () {
    var startMarker = document.createElement('em');
    startMarker.classList.add('editor-marker');
    var endMarker = document.createElement('em');
    endMarker.classList.add('editor-marker');

    // End marker
    var rangeEnd = this.range.cloneRange();
    rangeEnd.collapse(false);
    rangeEnd.insertNode(endMarker);

    if (!this.range.collapsed) {
      // Start marker
      var rangeStart = this.range.cloneRange();
      rangeStart.collapse(true);
      rangeStart.insertNode(startMarker);
    }

    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
  };

  Selection.prototype.getMarkers = function (editorNode) {
    return editorNode.querySelectorAll('em.editor-marker');
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
