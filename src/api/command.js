define(function () {

  'use strict';

  function Command(scribe, commandName) {
    this.scribe = scribe;
    this.commandName = commandName;
    this.patch = this.scribe.commandPatches[this.commandName];
  }

  Command.prototype.execute = function (value) {
    if (this.patch) {
      this.patch.execute(value);
    } else {
      document.execCommand(this.commandName, false, value || null);
    }
  };

  Command.prototype.queryState = function () {
    if (this.patch) {
      return this.patch.queryState();
    } else {
      return document.queryCommandState(this.commandName);
    }
  };

  Command.prototype.queryEnabled = function () {
    if (this.patch) {
      return this.patch.queryEnabled();
    } else {
      return document.queryCommandEnabled(this.commandName);
    }
  };

  return Command;

});
