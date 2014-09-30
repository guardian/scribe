define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var italicCommand = new scribe.api.CommandPatch('italic');

      italicCommand.execute = function () {
        scribe._skipFormatters = true;
        return scribe.api.CommandPatch.prototype.execute.apply(this, arguments);
      };

      scribe.commandPatches.italic = italicCommand;
    };
  };

});
