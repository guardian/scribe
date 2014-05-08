define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(function (html) {
        return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
      });
    };
  };

});
