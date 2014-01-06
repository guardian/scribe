define(function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var linkPromptCommand = new scribe.api.SimpleCommand('createLink', 'A');

      linkPromptCommand.execute = function () {
        var selection = new scribe.api.Selection();
        var range = selection.range;
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
        var initialLink = anchorNode ? anchorNode.href : 'http://';
        var link = window.prompt('Enter a link.', initialLink);

        if (anchorNode) {
          range.selectNode(anchorNode);
          selection.selection.removeAllRanges(range);
          selection.selection.addRange(range);
        }

        // FIXME: I don't like how plugins like this do so much. Is there a way
        // to compose?

        if (link) {
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

          scribe.api.SimpleCommand.prototype.execute.call(this, link);
        }
      };

      scribe.commands.linkPrompt = linkPromptCommand;
    };
  };

});
