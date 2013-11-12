define(function () {

  'use strict';

  function Command(commandName) {
    this.commandName = commandName;
  }

  Command.prototype.execute = function (value) {
    document.execCommand(this.commandName, false, value || null);
  };

  Command.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  return Command;

});
