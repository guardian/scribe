require({
  baseUrl: './src',
  paths: {
    'html-janitor': '../bower_components/html-janitor/src/html-janitor'
  }
}, [
  'editable',
  'plugins/sanitize'
], function (
  Editable,
  sanitize
) {
  var editable = new Editable(document.querySelector('.editor'));

  editable.use(sanitize({
    tags: {
      p: [],
      b: [],
      strong: [],
      i: [],
      s: [],
      blockquote: [],
      ol: [],
      ul: [],
      li: [],
      a: [ 'href' ],
      h2: []
    }
  }));
});
