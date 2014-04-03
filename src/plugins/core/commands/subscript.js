define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var superscriptCommand = new scribe.api.Command('subscript');

      scribe.commands.superscript = superscriptCommand;
    };
  };

});
