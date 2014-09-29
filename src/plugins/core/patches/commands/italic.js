define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var italicCommand = new scribe.api.CommandPatch('italic');

      italicCommand.queryEnabled = function () {
        scribe._skipFormatters = true;
        return scribe.api.CommandPatch.prototype.queryEnabled.apply(this, arguments);
      };

      scribe.commandPatches.italic = italicCommand;
    };
  };

});
