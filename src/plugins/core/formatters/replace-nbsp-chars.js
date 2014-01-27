define(function () {

  /**
   * Chrome:
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nbspChar = '\xA0';
      var nbspCharRegExp = new RegExp(nbspChar, 'g');

      scribe.formatter.formatters.push(function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };

});
