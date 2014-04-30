define(function () {

  /**
   * Chrome:
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nbspChar = '&nbsp;|\xA0';
      var nbspCharRegExp = new RegExp(nbspChar, 'g');

      // TODO: should we be doing this on paste?
      scribe.registerHtmlFormatter('normalize', function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };

});
