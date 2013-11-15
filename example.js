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
  'plugins/toolbar',
  'api',
  'api/command'
], function (
  Editable,
  blockquoteCommand,
  headingCommand,
  linkPromptCommand,
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
   * Plugins
   */

  editable.use(blockquoteCommand());
  editable.use(headingCommand(2));
  editable.use(linkPromptCommand());
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
  editable.use(toolbar(document.querySelectorAll('.toolbar')));

  /**
   * Keyboard shortcuts
   *
   * TODO: should this be defined *with* the command instead? If we did that,
   * how do we separate the core patches we have for commands (i.e. bold) from
   * stuff that is configurable. Also, currently we rely on native commands,
   * so things like italic are not defined.
   */

  function findCommand(commandName) {
    return editable.commands[commandName] || new api.Command(commandName);
  }

  document.addEventListener('keydown', function (event) {
    var command;
    if (event.metaKey && event.keyCode === 66) { // b
      command = findCommand('bold');
    } else if (event.metaKey && event.keyCode === 73) { // i
      command = findCommand('italic');
    } else if (event.altKey && event.shiftKey && event.keyCode === 83) { // s
      command = findCommand('strikethrough');
    } else if (event.altKey && event.shiftKey && event.keyCode === 65) { // a
      command = findCommand('removeFormat');
    } else if (event.metaKey && ! event.shiftKey && event.keyCode === 75) { // k
      command = findCommand('linkPrompt');
    } else if (event.metaKey && event.shiftKey && event.keyCode === 75) { // k
      command = findCommand('unlink');
    } else if (event.altKey && event.shiftKey && event.keyCode === 66) { // b
      command = findCommand('insertUnorderedList');
    } else if (event.altKey && event.shiftKey && event.keyCode === 78) { // n
      command = findCommand('insertOrderedList');
    } else if (event.altKey && event.shiftKey && event.keyCode === 87) { // w
      command = findCommand('blockquote');
    } else if (event.metaKey && event.keyCode === 50) { // 2
      command = findCommand('h2');
    }

    if (command) {
      event.preventDefault();

      command.execute();
    }
  });
});
