define([
  './../../../../shared/remove-chrome-artifacts'
], function (removeChromeArtifacts) {
  "use strict";
  return function () {
    return function (scribe) {
      var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

      insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);
          removeChromeArtifacts(scribe.el);
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };

});
