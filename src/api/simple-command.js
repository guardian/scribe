define([
  '../api',
  './command',
  './selection'
], function (
  api
) {

  'use strict';

  api.SimpleCommand = function (editor, commandName, nodeName) {
    api.Command.call(this, editor, commandName);

    this.nodeName = nodeName;
  };

  api.SimpleCommand.prototype = Object.create(api.Command.prototype);
  api.SimpleCommand.prototype.constructor = api.SimpleCommand;

  api.SimpleCommand.prototype.queryState = function () {
    var selection = new api.Selection();
    return !! selection.getContaining(function (node) {
      return node.nodeName === this.nodeName;
    }.bind(this));
  };

  return api;

});
