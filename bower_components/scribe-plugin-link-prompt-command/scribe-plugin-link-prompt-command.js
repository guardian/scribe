define('scribe-plugin-link-prompt-command',[],function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */

  

  return function () {
    return function (scribe) {
      var linkPromptCommand = new scribe.api.Command('createLink');

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {
        var selection = new scribe.api.Selection();
        var range = selection.range;
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
        var initialLink = anchorNode ? anchorNode.href : '';
        var link = window.prompt('Enter a link.', initialLink);

        if (anchorNode) {
          range.selectNode(anchorNode);
          selection.selection.removeAllRanges();
          selection.selection.addRange(range);
        }

        // FIXME: I don't like how plugins like this do so much. Is there a way
        // to compose?

        if (link) {
          // Prepend href protocol if missing
          // If a http/s or mailto link is provided, then we will trust that an link is valid
          var urlProtocolRegExp = /^https?\:\/\//;
          var mailtoProtocolRegExp = /^mailto\:/;
          if (! urlProtocolRegExp.test(link) && ! mailtoProtocolRegExp.test(link)) {
            // For emails we just look for a `@` symbol as it is easier.
            if (/@/.test(link)) {
              var shouldPrefixEmail = window.confirm(
                'The URL you entered appears to be an email address. ' +
                'Do you want to add the required “mailto:” prefix?'
              );
              if (shouldPrefixEmail) {
                link = 'mailto:' + link;
              }
            } else {
              var shouldPrefixLink = window.confirm(
                'The URL you entered appears to be a link. ' +
                'Do you want to add the required “http://” prefix?'
              );
              if (shouldPrefixLink) {
                link = 'http://' + link;
              }
            }
          }

          scribe.api.SimpleCommand.prototype.execute.call(this, link);
        }
      };

      linkPromptCommand.queryState = function () {
        /**
         * We override the native `document.queryCommandState` for links because
         * the `createLink` and `unlink` commands are not supported.
         * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
         */
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      scribe.commands.linkPrompt = linkPromptCommand;
    };
  };

});


//# sourceMappingURL=scribe-plugin-link-prompt-command.js.map