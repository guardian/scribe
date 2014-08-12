define(function () {

  'use strict';

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      if (scribe.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };

    CommandPatch.prototype.queryState = function () {
      return document.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return document.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});
