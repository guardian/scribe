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
  'plugins/blockquote-command',
  'plugins/formatters/convert-new-lines-to-html',
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
  blockquoteCommand,
  convertNewLinesToHtmlFormatter,
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
   * Plugins
   */

  scribe.use(blockquoteCommand());
  scribe.use(headingCommand(2));
  scribe.use(intelligentUnlinkCommand());
  scribe.use(linkPromptCommand());
  scribe.use(toolbar(document.querySelector('.toolbar')));
  scribe.use(smartLists());
  scribe.use(curlyQuotes());

  // Formatters
  scribe.use(sanitizer({
    tags: {
      p: {},
      br: {},
      b: {},
      strong: {},
      i: {},
      s: {},
      blockquote: {},
      ol: {},
      ul: {},
      li: {},
      a: { href: true },
      h2: {}
    }
  }));
  scribe.use(convertNewLinesToHtmlFormatter());

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

  if (scribe.allowsBlockElements()) {
    scribe.setContent('<p>Hello, World!</p>');
  } else {
    scribe.setContent('Hello, World!');
  }

  // Finally…
  scribe.initialize();
});
