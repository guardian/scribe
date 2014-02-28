require({
  baseUrl: '../../src',
  paths: {
    'event-emitter': '../../bower_components/eventEmitter/EventEmitter',
    'lodash-modern': '../../bower_components/lodash-amd/modern'
  },
  shim: {
    'event-emitter': {
      exports: 'EventEmitter'
    }
  }
});
