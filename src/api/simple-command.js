define([
  '../api',
  './command'
], function (
  api
) {

  'use strict';

  api.SimpleCommand = function (nodeName, commandName) {
    api.Command.call(this, commandName);

    this.nodeName = nodeName;
  };

  api.SimpleCommand.prototype = Object.create(api.Command.prototype);
  api.SimpleCommand.prototype.constructor = api.SimpleCommand;

  api.SimpleCommand.prototype.queryState = function () {
    var range = new api.Range();
    return !! range.getContaining(function (node) {
      return node.nodeName === this.nodeName;
    }.bind(this));
  };

  return api;

});
