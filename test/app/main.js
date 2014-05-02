require({
  paths: {
    'scribe-common': '../../bower_components/scribe-common/src',
    'event-emitter': '../../bower_components/eventEmitter/EventEmitter',
    'lodash-modern': '../../bower_components/lodash-amd/modern',
    'html-janitor':  '../../bower_components/html-janitor/html-janitor'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
});
