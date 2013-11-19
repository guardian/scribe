define([
  '../api',
  '../api/selection',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var blockquoteCommand = new api.SimpleCommand(editable, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        if (this.queryState()) {
          editable.execCommand('outdent');
        } else {
          editable.execCommand('indent');
        }
      };

      editable.commands.blockquote = blockquoteCommand;
    };
  };

});
