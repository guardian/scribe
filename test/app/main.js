require({
  baseUrl: '../../src',
  paths: {
    'event-emitter': '../../bower_components/eventEmitter/EventEmitter',
    'html-janitor': '../../bower_components/html-janitor/src/html-janitor',
    'lodash': '../../bower_components/lodash-amd/modern'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
});
