define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.commands.subscript = new scribe.api.Command('subscript');
    };
  };

});
