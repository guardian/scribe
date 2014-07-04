define(function () {

  'use strict';

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      scribe.transactionManager.run(function () {
        scribe.targetWindow.document.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      return scribe.targetWindow.document.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return scribe.targetWindow.document.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});
