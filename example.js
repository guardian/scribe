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
  'api',
  'api/command',
  'api/range'
], function (
  Editable,
  sanitizer,
  toolbar,
  api
) {

  'use strict';

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

  var linkPromptCommand = new api.Command('createLink');

  linkPromptCommand.execute = function () {
    var range = new api.Range();
    var anchorNode = range.getContaining(function (node) {
      return node.nodeName === 'A';
    });
    var initialUrl = anchorNode ? anchorNode.href : 'http://';
    var url = window.prompt('Enter a URL.', initialUrl);
    // Call the super
    api.Command.prototype.execute.call(this, url);
  };

  linkPromptCommand.queryState = function () {
    var range = new api.Range();
    return !! range.getContaining(function (node) {
      return node.nodeName === 'A';
    });
  };

  editable.commands.linkPrompt = linkPromptCommand;

  /**
   * Command: H2
   */

  var h2Command = new api.Command('formatBlock');

  h2Command.execute = function () {
    // Call the super
    if (this.queryState()) {
      api.Command.prototype.execute.call(this, '<p>');
    } else {
      api.Command.prototype.execute.call(this, '<h2>');
    }
  };

  h2Command.queryState = function () {
    var range = new api.Range();
    return !! range.getContaining(function (node) {
      return node.nodeName === 'H2';
    });
  };

  editable.commands.h2 = h2Command;

  /**
   * Command: Blockquote
   */

  var blockquoteCommand = new api.Command('formatBlock');

  blockquoteCommand.execute = function () {
    if (this.queryState()) {
      api.Command.prototype.execute.call(this, '<p>');
    } else {
      api.Command.prototype.execute.call(this, '<blockquote>');
    }
  };

  blockquoteCommand.queryState = function () {
    var range = new api.Range();
    return !! range.getContaining(function (node) {
      return node.nodeName === 'BLOCKQUOTE';
    });
  };

  editable.commands.blockquote = blockquoteCommand;

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
});
