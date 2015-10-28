define('checks',[], function () {

  

  function emptyLink(string) {
    return /\w/.test(string);
  }

  return {
    emptyLink: emptyLink
  };
});


define('scribe-plugin-link-prompt-command',['./checks'], function (checks) {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */

  

  return function (options) {
    var options = options || {};

    return function (scribe) {
      var linkPromptCommand = new scribe.api.Command('createLink');

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function (passedLink) {
        var link;
        var selection = new scribe.api.Selection();
        var range = selection.range;
        var anchorNode = selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));

        var initialLink = anchorNode ? anchorNode.href : '';

        if (!passedLink)  {
          link = window.prompt('Enter a link.', initialLink);
        } else {
          link = passedLink;
        }

        if(!checks.emptyLink(link)) {
          window.alert('This link appears empty');
          return;
        }

        if(options && options.validation) {
          var validationResult = options.validation(link);

          if(!validationResult.valid) {
            window.alert(validationResult.message || 'The link is not valid');
            return;
          }
        }

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