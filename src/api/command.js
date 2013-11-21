define([
  '../api'
], function (
  api
) {

  'use strict';

  api.Command = function (editor, commandName) {
    this.editor = editor;
    this.commandName = commandName;
    this.patchedCommand = this.editor.patchedCommands[this.commandName];
  };

  api.Command.prototype.execute = function (value) {
    if (this.patchedCommand) {
      this.patchedCommand.execute(value);
    } else {
      document.execCommand(this.commandName, false, value || null);
    }
  };

  api.Command.prototype.queryState = function () {
    if (this.patchedCommand) {
      return this.patchedCommand.queryState();
    } else {
      return document.queryCommandState(this.commandName);
    }
  };

  api.Command.prototype.queryEnabled = function () {
    if (this.patchedCommand) {
      return this.patchedCommand.queryEnabled();
    } else {
      return document.queryCommandEnabled(this.commandName);
    }
  };

  return api;

});
