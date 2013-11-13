define([
  '../api',
  '../api/command',
  '../api/range'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var blockquoteCommand = new api.Command('formatBlock');

      blockquoteCommand.execute = function () {
        if (this.queryState()) {
          api.Command.prototype.execute.call(this, '<p>');
        } else {
          api.Command.prototype.execute.call(this, '<blockquote>');
        }
      };

      blockquoteCommand.queryState = function () {
        var range = new api.Range();
        return !! range.getContaining(function (node) {
          return node.nodeName === 'BLOCKQUOTE';
        });
      };

      editable.commands.blockquote = blockquoteCommand;
    };
  };

});
