define([
  '../api',
  '../api/node'
], function (
  api
) {

  'use strict';

  api.Range = function () {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    this.commonAncestorContainer = range.commonAncestorContainer;
  };

  api.Range.prototype.getContaining = function (nodeFilter) {
    var node = new api.Node(this.commonAncestorContainer);
    return node.getAncestor(nodeFilter);
  };

  return api;

});
