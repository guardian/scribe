define([
  'lodash-amd/modern/string/escape'
], function (
  escape
) {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(escape);
    };
  };

});
