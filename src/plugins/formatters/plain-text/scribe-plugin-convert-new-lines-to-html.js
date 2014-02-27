define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.plainTextFormatter.formatters.push(function (html) {
        return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
      });
    };
  };

});
