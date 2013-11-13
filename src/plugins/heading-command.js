define([
  '../api',
  '../api/command',
  '../api/range'
], function (
  api
) {

  'use strict';

  return function (level) {
    return function (editable) {
      var headingCommand = new api.Command('formatBlock');
      var headingTag = '<h' + level + '>';
      var headingNodeName = 'H' + level;
      var commandName = 'h' + level;

      headingCommand.execute = function () {
        if (this.queryState()) {
          api.Command.prototype.execute.call(this, '<p>');
        } else {
          api.Command.prototype.execute.call(this, headingTag);
        }
      };

      headingCommand.queryState = function () {
        var range = new api.Range();
        return !! range.getContaining(function (node) {
          return node.nodeName === headingNodeName;
        });
      };

      editable.commands[commandName] = headingCommand;
    };
  };

});
