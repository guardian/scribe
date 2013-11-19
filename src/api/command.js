define([
  '../api'
], function (
  api
) {

  'use strict';

  api.Command = function (editor, commandName) {
    this.editor = editor;
    this.commandName = commandName;
  };

  api.Command.prototype.execute = function (value) {
    this.editor.execCommand(this.commandName, value);
  };

  api.Command.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  return api;

});
