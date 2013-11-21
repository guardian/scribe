define([
  '../api'
], function (
  api
) {

  'use strict';

  api.CommandPatch = function (commandName) {
    this.commandName = commandName;
  };

  api.CommandPatch.prototype.execute = function (value) {
    document.execCommand(this.commandName, false, value || null);
  };

  api.CommandPatch.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  api.CommandPatch.prototype.queryEnabled = function () {
    return document.queryCommandEnabled(this.commandName);
  };

  return api;

});
