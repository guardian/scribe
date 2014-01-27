define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      scribe.formatter.formatters.push(function (html) {
        // Simple heuristic. Might need improving?
        var isHtml = html.match('<p>');
        var isPlainText = ! isHtml;
        return isPlainText && html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>') || html;
      });
    };
  };

});
