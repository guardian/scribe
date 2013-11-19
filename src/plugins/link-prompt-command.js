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
      var nodeName = 'A';

      var linkPromptCommand = new api.SimpleCommand(editor, 'createLink', nodeName);

      linkPromptCommand.execute = function () {
        var selection = new api.Selection();
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === nodeName;
        });
        var initialUrl = anchorNode ? anchorNode.href : 'http://';
        var url = window.prompt('Enter a URL.', initialUrl);
        api.Command.prototype.execute.call(this, url);
      };

      editor.commands.linkPrompt = linkPromptCommand;
    };
  };

});
