require({
  baseUrl: './src',
  paths: {
    'html-janitor': '../bower_components/html-janitor/src/html-janitor'
  }
}, [
  'editable',
  'plugins/sanitizer',
  'plugins/toolbar',
  'api/command'
], function (
  Editable,
  sanitizer,
  toolbar,
  Command
) {
  var editable = new Editable(document.querySelector('.editor'));

  editable.el.addEventListener('input', updateHTML);

  function updateHTML() {
    document.querySelector('.editor-html').textContent = editable.el.innerHTML;
  }

  /**
   * Inline/tooltip style toolbar
   */

  // Unfortunately, there is no `selectionchange` event.
  editable.el.addEventListener('keyup', showOrHideInlineToolbar);
  editable.el.addEventListener('mouseup', showOrHideInlineToolbar);

  var tooltip = document.createElement('div');
  // Lazily copy the existing toolbar, insert it dynamically
  tooltip.appendChild(document.querySelector('.toolbar').cloneNode(true));
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  function showOrHideInlineToolbar() {
    // TODO: use internal API for getting range
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    if (range.commonAncestorContainer.textContent && ! selection.isCollapsed) {
      var boundary = range.getClientRects()[0];

      tooltip.style.position = 'absolute';
      tooltip.hidden = false;
      tooltip.style.left = (((boundary.left + boundary.right) / 2) - (tooltip.offsetWidth / 2)) + 'px';
      tooltip.style.top = boundary.top - tooltip.offsetHeight + 'px';
    } else {
      tooltip.hidden = true;
    }
  }

  /**
   * Toolbar extensions depend on the toolbar plugin, which will implicitly register
   * the click handler.
   */

  /**
   * Toolbar extension: link buttons
   */

  var createLinkBtns = document.querySelectorAll('.toolbar .create-link-btn');

  Array.prototype.forEach.call(createLinkBtns, function (createLinkBtn) {
    createLinkBtn.editor = {};
    createLinkBtn.editor.command = new Command('createLink');

    createLinkBtn.editor.command.execute = function () {
      var anchorNode = getContaining(function (node) {
        return node.nodeName === 'A';
      });
      var initialUrl = anchorNode ? anchorNode.href : 'http://';
      var url = window.prompt('Enter a URL.', initialUrl);
      // Call the super
      Command.prototype.execute.call(this, url);
    };

    createLinkBtn.editor.command.queryState = function () {
      return getContaining(function (node) {
        return node.nodeName === 'A';
      });
    };
  });

  /**
   * Toolbar extension: H1 buttons
   */

  var h1Btns = document.querySelectorAll('.toolbar .h1-btn');

  Array.prototype.forEach.call(h1Btns, function (h1Btn) {
    h1Btn.editor = {};
    h1Btn.editor.command = new Command('formatBlock');

    h1Btn.editor.command.execute = function () {
      // Call the super
      if (this.queryState()) {
        Command.prototype.execute.call(this, '<p>');
      } else {
        Command.prototype.execute.call(this, '<h1>');
      }
    };

    h1Btn.editor.command.queryState = function () {
      return getContaining(function (node) {
        return node.nodeName === 'H1';
      });
    };
  });

  /**
   * Plugins
   */

  editable.use(toolbar(document.querySelectorAll('.toolbar')));
  editable.use(sanitizer({
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

  /**
   * Shared functions, move into API?
   */

  function getContaining(nodeFilter) {
    // TODO: use internal API for getting range
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    return getAncestor(range.commonAncestorContainer, nodeFilter);
  }

  function getAncestor(node, nodeFilter) {
    // TODO: use do instead?
    while (node && node.nodeName !== 'body') {
      if (nodeFilter(node)) {
        return node;
      }
      node = node.parentNode;
    }
  }
});
