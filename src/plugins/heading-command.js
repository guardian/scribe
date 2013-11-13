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

      var headingCommand = new api.SimpleCommand(nodeName, 'formatBlock');

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
