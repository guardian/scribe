require({
  baseUrl: './src',
  paths: {
    'html-janitor': '../bower_components/html-janitor/src/html-janitor',
    'q': '../bower_components/q/q'
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
   * Command: Link prompt
   */

  var linkPromptCommand = new Command('createLink');

  linkPromptCommand.execute = function () {
    var anchorNode = getContaining(function (node) {
      return node.nodeName === 'A';
    });
    var initialUrl = anchorNode ? anchorNode.href : 'http://';
    var url = window.prompt('Enter a URL.', initialUrl);
    // Call the super
    Command.prototype.execute.call(this, url);
  };

  linkPromptCommand.queryState = function () {
    return getContaining(function (node) {
      return node.nodeName === 'A';
    });
  };

  editable.commands.linkPrompt = linkPromptCommand;

  /**
   * Command: H1
   */

  var h1Command = new Command('formatBlock');

  h1Command.execute = function () {
    // Call the super
    if (this.queryState()) {
      Command.prototype.execute.call(this, '<p>');
    } else {
      Command.prototype.execute.call(this, '<h1>');
    }
  };

  h1Command.queryState = function () {
    return getContaining(function (node) {
      return node.nodeName === 'H1';
    });
  };

  editable.commands.h1 = h1Command;

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
