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
  'editor'
], function (
  Editor
) {

  'use strict';

  var editor = new Editor(document.querySelector('.editor'));

  editor.on('content-changed', updateHTML);

  function updateHTML() {
    document.querySelector('.editor-html').textContent = editor.el.innerHTML;
  }

  editor.initialize();

});
