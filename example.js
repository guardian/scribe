require({
  baseUrl: './src',
  paths: {
    'html-janitor': '../bower_components/html-janitor/src/html-janitor'
  }
}, [
  'editable',
  'plugins/sanitize',
  'plugins/toolbar',
  'api/command'
], function (
  Editable,
  sanitize,
  toolbar,
  Command
) {
  var editable = new Editable(document.querySelector('.editor'));

  editable.el.addEventListener('input', updateHTML);

  /**
   * The link button depends on the toolbar plugin, which will implicitly register
   * the click handler.
   */

  var createLinkBtn = document.querySelector('.toolbar .create-link-btn');

  createLinkBtn.editor = {};
  createLinkBtn.editor.command = new Command('createLink');

  createLinkBtn.editor.command.execute = function () {
    var parentNode = selectionParentNode();
    var initialUrl = parentNode.nodeName === 'A' ? parentNode.href : 'http://';
    var url = window.prompt('Enter a URL.', initialUrl);
    // Call the super
    Command.prototype.execute.call(this, url);
  };

  createLinkBtn.editor.command.queryState = function () {
    return selectionParentNode().nodeName === 'A';
  };

  /**
   * Plugins
   */

  editable.use(toolbar(document.querySelector('.toolbar')));
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

  function updateHTML() {
    document.querySelector('.editor-html').textContent = editable.el.innerHTML;
  }

  function selectionParentNode() {
    // TODO: use internal API for getting range
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    return range.commonAncestorContainer.parentNode;
  }
});
