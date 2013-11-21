require({
  baseUrl: './src',
  paths: {
    'event-emitter': '../bower_components/eventEmitter/EventEmitter',
    'html-janitor': '../bower_components/html-janitor/src/html-janitor'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
}, [
  'editor',
  'plugins/blockquote-command',
  'plugins/heading-command',
  'plugins/intelligent-unlink-command',
  'plugins/link-prompt-command',
  'plugins/sanitizer',
  'plugins/toolbar',
  'api',
  'api/command'
], function (
  Editor,
  blockquoteCommand,
  headingCommand,
  intelligentUnlinkCommand,
  linkPromptCommand,
  sanitizer,
  toolbar,
  api
) {

  'use strict';

  var editor = new Editor(document.querySelector('.editor'));

  editor.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.editor-html').textContent = editor.el.innerHTML;
  }

  /**
   * Inline/tooltip style toolbar
   */

  // Unfortunately, there is no `selectionchange` event.
  editor.el.addEventListener('keyup', showOrHideInlineToolbar);
  editor.el.addEventListener('mouseup', showOrHideInlineToolbar);

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

  editor.use(blockquoteCommand());
  editor.use(headingCommand(2));
  editor.use(intelligentUnlinkCommand());
  editor.use(linkPromptCommand());
  editor.use(sanitizer({
    tags: {
      p: [],
      br: [],
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
  editor.use(toolbar(document.querySelectorAll('.toolbar')));

  /**
   * Keyboard shortcuts
   *
   * TODO: should this be defined *with* the command instead? If we did that,
   * how do we separate the core patches we have for commands (i.e. bold) from
   * stuff that is configurable. Also, currently we rely on native commands,
   * so things like italic are not defined.
   */

  function findCommand(commandName) {
    return editor.commands[commandName] || new api.Command(editor, commandName);
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

  /**
   * Rename nodes
   */

  editor.formatters.push(function (html) {
    var config = {
      b: 'strong'
    };

    var sandboxNode = document.createElement('div');
    sandboxNode.innerHTML = html;

    renameNodes(sandboxNode);

    return sandboxNode.innerHTML;

    function renameNodes(parentNode) {
      var treeWalker = createTreeWalker(parentNode);
      var node = treeWalker.firstChild();
      if (!node) { return; }

      do {
        var lowerCaseNodeName = node.nodeName.toLowerCase();

        // Ignore text nodes and nodes that have already been transformed
        if (node.nodeType === 3 || node._transformed) {
          continue;
        }

        var transformNodeName = config[lowerCaseNodeName];
        if (transformNodeName) {
          var transformNode = document.createElement(transformNodeName);
          transformNode.innerHTML = node.innerHTML;
          parentNode.insertBefore(transformNode, node);
          // TODO: remove on node directly?
          parentNode.removeChild(node);

          renameNodes(parentNode);
          break;
        }

        // Sanitize children
        renameNodes(node);

        // Mark node as transformed so it's ignored in future runs
        node._transformed = true;
      } while (node = treeWalker.nextSibling());
    }

    function createTreeWalker(node) {
      return document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
    }

  });

  // Finally…
  editor.initialize();
});
