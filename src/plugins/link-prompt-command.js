define([
  '../api',
  '../api/range',
  '../api/simple-command'
], function (
  api
) {

  'use strict';

  return function () {
    return function (editable) {
      var nodeName = 'A';

      var linkPromptCommand = new api.SimpleCommand(nodeName, 'createLink');

      linkPromptCommand.execute = function () {
        var range = new api.Range();
        var anchorNode = range.getContaining(function (node) {
          return node.nodeName === nodeName;
        });
        var initialUrl = anchorNode ? anchorNode.href : 'http://';
        var url = window.prompt('Enter a URL.', initialUrl);
        api.Command.prototype.execute.call(this, url);
      };

      editable.commands.linkPrompt = linkPromptCommand;
    };
  };

});
