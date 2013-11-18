define([
  '../api',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function (level) {
    return function (editable) {
      var tag = '<h' + level + '>';
      var nodeName = 'H' + level;
      var commandName = 'h' + level;

      /**
       * Chrome: the `heading` command doesn't work. Supported by Firefox only.
       */

      var headingCommand = new api.SimpleCommand(editable, 'formatBlock', nodeName);

      headingCommand.execute = function () {
        if (this.queryState()) {
          api.Command.prototype.execute.call(this, '<p>');
        } else {
          api.Command.prototype.execute.call(this, tag);
        }
      };

      editable.commands[commandName] = headingCommand;
    };
  };

});
