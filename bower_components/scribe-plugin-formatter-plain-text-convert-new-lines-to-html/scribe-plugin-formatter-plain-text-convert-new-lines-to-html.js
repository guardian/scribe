define('scribe-plugin-formatter-plain-text-convert-new-lines-to-html',[],function () {

  

  return function () {
    return function (scribe) {
      scribe.plainTextFormatter.formatters.push(function (html) {
        return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
      });
    };
  };

});

//# sourceMappingURL=scribe-plugin-formatter-plain-text-convert-new-lines-to-html.js.map