define([
  '../api'
], function (
  api
) {

  'use strict';

  api.Command = function (editable, commandName) {
    this.editable = editable;
    this.commandName = commandName;
  };

  api.Command.prototype.execute = function (value) {
    this.editable.execCommand(this.commandName, value);
  };

  api.Command.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  return api;

});
