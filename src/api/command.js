define([
  '../api'
], function (
  api
) {

  'use strict';

  api.Command = function (commandName) {
    this.commandName = commandName;
  };

  api.Command.prototype.execute = function (value) {
    document.execCommand(this.commandName, false, value || null);
  };

  api.Command.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  return api;

});
