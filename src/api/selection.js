define([
  '../api',
  './node'
], function (
  api
) {

  'use strict';

  api.Selection = function () {
    this.selection = window.getSelection();
    this.range = this.selection.getRangeAt(0);
  };

  api.Selection.prototype.getContaining = function (nodeFilter) {
    var node = new api.Node(this.range.commonAncestorContainer);
    return node.getAncestor(nodeFilter);
  };

  api.Selection.prototype.placeMarkers = function () {
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
      rangeStart.collapse(false);
      rangeStart.insertNode(startMarker);
    }

    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
  };

  api.Selection.prototype.getMarkers = function (editorNode) {
    return editorNode.querySelectorAll('em.editor-marker');
  };

  api.Selection.prototype.removeMarkers = function (editorNode) {
    var markers = this.getMarkers(editorNode);
    Array.prototype.forEach.call(markers, function (marker) {
      marker.parentNode.removeChild(marker);
    });
  };

  // TODO: use range for editorNode?
  api.Selection.prototype.selectMarkers = function (editorNode) {
    var markers = this.getMarkers(editorNode);
    if (!markers.length) {
      return;
    }

    this.range.setStartBefore(markers[0]);
    if (markers.length >= 2) {
      this.range.setEndBefore(markers[1]);
    }

    this.removeMarkers(editorNode);

    this.selection.removeAllRanges();
    this.selection.addRange(this.range);
  };

  return api;

});
