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
  },
  packages: [
    {
      name: 'lodash',
      location: '../../bower_components/lodash-amd/modern'
    }
  ]
});
