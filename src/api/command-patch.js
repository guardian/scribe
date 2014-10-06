define(function () {

  'use strict';

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      scribe.transactionManager.run(function () {
        scribe.el.ownerDocument.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      return scribe.el.ownerDocument.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return scribe.el.ownerDocument.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});
