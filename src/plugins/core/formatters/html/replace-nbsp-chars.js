define(function () {

  /**
   * Chrome:
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nbspCharRegExp = /(\s|&nbsp;)+/g;

      // TODO: should we be doing this on paste?
      scribe.registerHTMLFormatter('export', function (html) {
        /*
        Applying the formatting if there is a space in Chrome prevents a
        command from being executed. Italic and bold commands now enforce
        the formatters to be skipped so that the NBSP is not replaced until
        after the command has been executed.
         */
        if (!scribe._skipFormatters) {
          return html.replace(nbspCharRegExp, ' ');
        } else {
          return html;
        }
      });
    };
  };

});
