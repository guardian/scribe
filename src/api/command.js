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
          scribe.el.ownerDocument.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };

    Command.prototype.queryState = function () {
      if (this.patch) {
        return this.patch.queryState();
      } else {
        return scribe.el.ownerDocument.queryCommandState(this.commandName);
      }
    };

    Command.prototype.queryEnabled = function () {
      if (this.patch) {
        return this.patch.queryEnabled();
      } else {
        return scribe.el.ownerDocument.queryCommandEnabled(this.commandName);
      }
    };

    return Command;
  };

});
