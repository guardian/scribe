define(function (require) {

  'use strict';

  return function Api(scribe) {
    this.CommandPatch = require('./api/command-patch')(scribe);
    this.Command = require('./api/command')(scribe);
    this.Node = require('./api/node');
    this.Selection = require('./api/selection')(scribe);
    this.SimpleCommand = require('./api/simple-command')(this, scribe);
  };
});
