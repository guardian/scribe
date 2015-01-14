define(function () {

  'use strict';

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      scribe.transactionManager.run(function () {
        scribe.targetDocument.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      return scribe.targetDocument.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return scribe.targetDocument.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});
