define([
  '../api',
  '../api/selection',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editor) {
      var blockquoteCommand = new api.SimpleCommand(editor, 'blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        if (this.queryState()) {
          editor.execCommand('outdent');
        } else {
          editor.execCommand('indent');
        }
      };

      editor.commands.blockquote = blockquoteCommand;
    };
  };

});
