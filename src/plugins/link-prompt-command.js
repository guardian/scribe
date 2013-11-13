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
      var linkPromptCommand = new api.Command('createLink');

      linkPromptCommand.execute = function () {
        var range = new api.Range();
        var anchorNode = range.getContaining(function (node) {
          return node.nodeName === 'A';
        });
        var initialUrl = anchorNode ? anchorNode.href : 'http://';
        var url = window.prompt('Enter a URL.', initialUrl);
        api.Command.prototype.execute.call(this, url);
      };

      linkPromptCommand.queryState = function () {
        var range = new api.Range();
        return !! range.getContaining(function (node) {
          return node.nodeName === 'A';
        });
      };

      editable.commands.linkPrompt = linkPromptCommand;
    };
  };

});
