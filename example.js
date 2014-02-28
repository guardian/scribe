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
  'plugins/scribe-plugin-blockquote-command',
  'plugins/formatters/plain-text/scribe-plugin-convert-new-lines-to-html',
  'plugins/scribe-plugin-heading-command',
  'plugins/scribe-plugin-intelligent-unlink-command',
  'plugins/scribe-plugin-link-prompt-command',
  'plugins/scribe-plugin-sanitizer',
  'plugins/scribe-plugin-toolbar',
  'plugins/scribe-plugin-smart-lists',
  'plugins/scribe-plugin-curly-quotes',
  'plugins/scribe-plugin-keyboard-shortcuts'
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

  scribe.on('content-changed', function updateHTML() {
    document.querySelector('.scribe-html').textContent = scribe.getHTML();
  });

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

   // Canonical 'Ctrl' key for Windows and Mac keyboards
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
});
