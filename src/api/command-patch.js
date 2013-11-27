define(function () {

  'use strict';

  function CommandPatch(commandName) {
    this.commandName = commandName;
  }

  CommandPatch.prototype.execute = function (value) {
    document.execCommand(this.commandName, false, value || null);
  };

  CommandPatch.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  CommandPatch.prototype.queryEnabled = function () {
    return document.queryCommandEnabled(this.commandName);
  };

  return CommandPatch;

});
