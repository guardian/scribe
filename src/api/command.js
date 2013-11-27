define(function () {

  'use strict';

  function Command(editor, commandName) {
    this.editor = editor;
    this.commandName = commandName;
    this.patchedCommand = this.editor.patchedCommands[this.commandName];
  }

  Command.prototype.execute = function (value) {
    if (this.patchedCommand) {
      this.patchedCommand.execute(value);
    } else {
      document.execCommand(this.commandName, false, value || null);
    }
  };

  Command.prototype.queryState = function () {
    if (this.patchedCommand) {
      return this.patchedCommand.queryState();
    } else {
      return document.queryCommandState(this.commandName);
    }
  };

  Command.prototype.queryEnabled = function () {
    if (this.patchedCommand) {
      return this.patchedCommand.queryEnabled();
    } else {
      return document.queryCommandEnabled(this.commandName);
    }
  };

  return Command;

});
