require({
  baseUrl: './src',
  paths: {
    'html-janitor': '../bower_components/html-janitor/src/html-janitor',
    'q': '../bower_components/q/q'
  }
}, [
  'editable',
  'plugins/blockquote-command',
  'plugins/heading-command',
  'plugins/link-prompt-command',
  'plugins/sanitizer',
  'plugins/toolbar'
], function (
  Editable,
  blockquoteCommand,
  headingCommand,
  linkPromptCommand,
  sanitizer,
  toolbar
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
   * Plugins
   */

  editable.use(blockquoteCommand());
  editable.use(headingCommand(2));
  editable.use(linkPromptCommand());
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
