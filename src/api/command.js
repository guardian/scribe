define(function () {

  'use strict';

  return function (scribe) {
    function Command(commandName) {
      this.commandName = commandName;
      this.patch = scribe.commandPatches[this.commandName];
    }

    Command.prototype.execute = function (value) {
      if (this.patch) {
        this.patch.execute(value);
      } else {
        scribe.transactionManager.start();
        document.execCommand(this.commandName, false, value || null);
        scribe.transactionManager.end();
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
  };

});
