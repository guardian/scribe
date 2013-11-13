define([
  '../api',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var blockquoteCommand = new api.SimpleCommand('BLOCKQUOTE', 'formatBlock');

      blockquoteCommand.execute = function () {
        if (this.queryState()) {
          api.Command.prototype.execute.call(this, '<p>');
        } else {
          api.Command.prototype.execute.call(this, '<blockquote>');
        }
      };

      editable.commands.blockquote = blockquoteCommand;
    };
  };

});
