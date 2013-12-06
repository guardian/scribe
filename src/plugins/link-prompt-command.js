define([
  '../api/selection',
  '../api/simple-command'
], function (
  Selection,
  SimpleCommand
) {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var nodeName = 'A';

      var linkPromptCommand = new SimpleCommand(scribe, 'createLink', nodeName);

      linkPromptCommand.execute = function () {
        var selection = new Selection();
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === nodeName;
        });
        var initialLink = anchorNode ? anchorNode.href : 'http://';
        var link = window.prompt('Enter a link.', initialLink);

        // FIXME: I don't like how plugins like this do so much. Is there a way
        // to compose?

        // Prepend href protocol if missing
        // For emails we just look for a `@` symbol as it is easier.
        if (! /^mailto\:/.test(link) && /@/.test(link)) {
          var shouldPrefixEmail = window.confirm(
            'The URL you entered appears to be an email address. ' +
            'Do you want to add the required “mailto:” prefix?'
          );
          if (shouldPrefixEmail) {
            link = 'mailto:' + link;
          }
        } else if (! /^https?\:\/\//.test(link)) {
          var shouldPrefixLink = window.confirm(
            'The URL you entered appears to be a link. ' +
            'Do you want to add the required “http://” prefix?'
          );
          if (shouldPrefixLink) {
            link = 'http://' + link;
          }
        }

        SimpleCommand.prototype.execute.call(this, link);
      };

      scribe.commands.linkPrompt = linkPromptCommand;
    };
  };

});
