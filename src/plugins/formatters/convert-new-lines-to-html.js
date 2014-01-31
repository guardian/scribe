define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.formatter.formatters.push(function (html) {
        // If plain text, HTML should have been escaped
        var isHtml = html.match('<');
        var isPlainText = ! isHtml;
        return isPlainText && html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>') || html;
      });
    };
  };

});
