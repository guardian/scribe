define([
  '../api',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var blockquoteCommand = new api.SimpleCommand('BLOCKQUOTE', 'blockquote');

      blockquoteCommand.execute = function () {
        if (this.queryState()) {
          document.execCommand('outdent');
        } else {
          document.execCommand('indent');
        }
      };

      editable.commands.blockquote = blockquoteCommand;
    };
  };

});
