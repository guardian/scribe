require({
  baseUrl: './src',
  paths: {
    'event-emitter': '../bower_components/eventEmitter/EventEmitter',
    'html-janitor': '../bower_components/html-janitor/src/html-janitor',
    'lodash-modern': '../bower_components/lodash-amd/modern'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
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
  'plugins/curly-quotes',
  'plugins/keyboard-shortcuts'
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
  curlyQuotes,
  keyboardShortcuts
) {

  'use strict';

  var scribe = new Scribe(document.querySelector('.scribe'), { allowBlockElements: true });

  scribe.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.scribe-html').textContent = scribe.getHTML();
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
   */

  var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

  var commandsToKeyboardShortcutsMap = Object.freeze({
    bold: function (event) { return event.metaKey && event.keyCode === 66; }, // b
    italic: function (event) { return event.metaKey && event.keyCode === 73; }, // i
    strikeThrough: function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }, // s
    removeFormat: function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }, // a
    linkPrompt: function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }, // k
    unlink: function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }, // k,
    insertUnorderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }, // b
    insertOrderedList: function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }, // n
    blockquote: function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }, // w
    h2: function (event) { return ctrlKey(event) && event.keyCode === 50; }, // 2
  });

  scribe.use(keyboardShortcuts(commandsToKeyboardShortcutsMap));

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

  if (scribe.allowsBlockElements()) {
    scribe.setContent('<p>Hello, World!</p>');
  } else {
    scribe.setContent('Hello, World!');
  }

  // Finally…
  scribe.initialize();
});
