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
        scribe.transactionManager.run(function () {
          scribe.targetWindow.document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };

    Command.prototype.queryState = function () {
      if (this.patch) {
        return this.patch.queryState();
      } else {
        return scribe.targetWindow.document.queryCommandState(this.commandName);
      }
    };

    Command.prototype.queryEnabled = function () {
      if (this.patch) {
        return this.patch.queryEnabled();
      } else {
        return scribe.targetWindow.document.queryCommandEnabled(this.commandName);
      }
    };

    return Command;
  };

});
