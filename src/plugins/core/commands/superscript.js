define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.commands.superscript = new scribe.api.Command('superscript');
    };
  };

});
