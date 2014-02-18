define([
  'lodash-modern/utilities/escape'
], function (
  escape
) {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.plainTextFormatter.formatters.push(escape);
    };
  };

});
