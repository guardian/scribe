require({
  baseUrl: './src',
  paths: {
    'event-emitter': '../bower_components/eventEmitter/EventEmitter',
    'html-janitor': '../bower_components/html-janitor/src/html-janitor',
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  },
  packages: [
    {
      name: 'lodash',
      location: '../bower_components/lodash-amd/modern'
    }
  ]
}, [
  'scribe',
  'api/selection',
  'plugins/blockquote-command',
  'plugins/heading-command',
  'plugins/intelligent-unlink-command',
  'plugins/link-prompt-command',
  'plugins/sanitizer',
  'plugins/toolbar',
  'plugins/smart-lists',
  'plugins/curly-quotes'
], function (
  Scribe,
  Selection,
  blockquoteCommand,
  headingCommand,
  intelligentUnlinkCommand,
  linkPromptCommand,
  sanitizer,
  toolbar,
  smartLists,
  curlyQuotes
) {

  'use strict';

  var scribe = new Scribe(document.querySelector('.scribe'), { allowBlockElements: true });

  scribe.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.scribe-html').textContent = scribe.el.innerHTML;
  }

  /**
   * Inline/tooltip style toolbar
   */

  // Unfortunately, there is no `selectionchange` event.
  scribe.el.addEventListener('keyup', showOrHideInlineToolbar);
  scribe.el.addEventListener('mouseup', showOrHideInlineToolbar);

  var tooltip = document.createElement('div');
  // Lazily copy the existing toolbar, insert it dynamically
  tooltip.appendChild(document.querySelector('.toolbar').cloneNode(true));
  tooltip.hidden = true;
  document.body.appendChild(tooltip);

  function showOrHideInlineToolbar() {
    // TODO: use internal API for getting range
    var selection = new Selection();
    var range = selection.range;

    if (range.commonAncestorContainer.textContent && ! selection.selection.isCollapsed) {
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

  scribe.use(blockquoteCommand());
  scribe.use(headingCommand(2));
  scribe.use(intelligentUnlinkCommand());
  scribe.use(linkPromptCommand());
  scribe.use(sanitizer({
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
  Array.prototype.forEach.call(document.querySelectorAll('.toolbar'), function (toolbarNode) {
    scribe.use(toolbar(toolbarNode));
  });
  scribe.use(smartLists());
  scribe.use(curlyQuotes());

  /**
   * Keyboard shortcuts
   *
   * TODO: should this be defined *with* the command instead? If we did that,
   * how do we separate the core patches we have for commands (i.e. bold) from
   * stuff that is configurable. Also, currently we rely on native commands,
   * so things like italic are not defined.
   */

  scribe.el.addEventListener('keydown', function (event) {
    var command;
    var ctrlKey = event.metaKey || event.ctrlKey;

    if (ctrlKey && event.keyCode === 66) { // b
      command = scribe.getCommand('bold');
    } else if (ctrlKey && event.keyCode === 73) { // i
      command = scribe.getCommand('italic');
    } else if (event.altKey && event.shiftKey && event.keyCode === 83) { // s
      command = scribe.getCommand('strikethrough');
    } else if (event.altKey && event.shiftKey && event.keyCode === 65) { // a
      command = scribe.getCommand('removeFormat');
    } else if (ctrlKey && ! event.shiftKey && event.keyCode === 75) { // k
      command = scribe.getCommand('linkPrompt');
    } else if (ctrlKey && event.shiftKey && event.keyCode === 75) { // k
      command = scribe.getCommand('unlink');
    } else if (event.altKey && event.shiftKey && event.keyCode === 66) { // b
      command = scribe.getCommand('insertUnorderedList');
    } else if (event.altKey && event.shiftKey && event.keyCode === 78) { // n
      command = scribe.getCommand('insertOrderedList');
    } else if (event.altKey && event.shiftKey && event.keyCode === 87) { // w
      command = scribe.getCommand('blockquote');
    } else if (ctrlKey && event.keyCode === 50) { // 2
      command = scribe.getCommand('h2');
    }

    if (command) {
      event.preventDefault();

      if (command.queryEnabled()) {
        command.execute();
      }
    }
  });

  /**
   * Rename nodes
   */

  scribe.formatters.push(function (html) {
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

  scribe.setHTML('<p>Hello, World!</p>');

  scribe.pushHistory();
  scribe.trigger('content-changed');

  // Finally…
  scribe.initialize();
});
