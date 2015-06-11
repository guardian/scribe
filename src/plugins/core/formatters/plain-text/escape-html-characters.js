define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(function(str) {
        return str.replace('&', '&amp;')
          .replace('<', '&lt;')
          .replace('\'', '&apos;')
          .replace('"', '&quot;');
      });
    };
  };

});
