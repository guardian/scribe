require({
  baseUrl: '../../src',
  paths: {
    'event-emitter': '../../bower_components/eventEmitter/EventEmitter',
    'html-janitor': '../../bower_components/html-janitor/src/html-janitor'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
}, [
  'editor',
  'plugins/toolbar',
  'plugins/smart-list',
  'plugins/curly-quotes'
], function (
  Editor,
  toolbar,
  smartList,
  curlyQuotes
) {

  'use strict';

  var editor = new Editor(document.querySelector('.editor'), { paragraphs: true });

  editor.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.editor-html').textContent = editor.el.innerHTML;
  }

  editor.use(toolbar(document.querySelectorAll('.toolbar')));
  editor.use(smartList());
  editor.use(curlyQuotes());

  editor.initialize();

});
