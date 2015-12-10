define('checks',[], function () {

  

  var urlProtocolRegExp = /^https?\:\/\//;
  var mailtoProtocolRegExp = /^mailto\:/;
  var telProtocolRegExp = /^tel\:/;

  var knownProtocols = [urlProtocolRegExp, mailtoProtocolRegExp, telProtocolRegExp];

  function emptyLink(string) {
    return /\w/.test(string);
  }

  function hasKnownProtocol(urlValue) {
    // If a http/s or mailto link is provided, then we will trust that an link is valid
    return knownProtocols.some(function(protocol) { return protocol.test(urlValue)});
  }

  return {
    emptyLink: emptyLink,
    hasKnownProtocol: hasKnownProtocol
  };
});

define('init',[], function () {

  function init(options) {
    var options = options || {};

    if(!options.transforms) {
      options.transforms = {};
    }

    ['pre', 'post'].forEach(function(key) {
      if(!options.transforms[key]) {
        options.transforms[key] = [];
      }
    });

    return options;
  }

  return {
    init: init
  }
});

define('prompts',[], function() {

  var userPrompts = [
    {
      // For emails we just look for a `@` symbol as it is easier.
      regexp: /@/,
      message: 'The URL you entered appears to be an email address. ' +
      'Do you want to add the required “mailto:” prefix?',
      action: function(link) {
        return 'mailto:' + link;
      }
    },
    {
      // For tel numbers check for + and numerical values
      regexp: /\+?\d+/,
      message: 'The URL you entered appears to be a telephone number. ' +
                'Do you want to add the required “tel:” prefix?',
      action: function(link) {
        return 'tel:' + link;
      }
    },
    {
      regexp: /.+/,
      message: 'The URL you entered appears to be a link. ' +
                'Do you want to add the required “http://” prefix?',
      action: function(link) {
        return 'http://' + link;
      }
    }
  ];

  function process(window, link) {
    for (var i = 0; i < userPrompts.length; i++) {
      var prompt = userPrompts[i];

      if(prompt.regexp.test(link)) {
        var userResponse = window.confirm(prompt.message);

        if(userResponse) {
          // Only process the first prompt
          return prompt.action(link);
        }
      }

    };

    return link;
  }

  return {
    process: process
  }

});

define('transforms',[], function () {


  function run(transforms, initialLink) {
    return transforms.reduce(function(currentLinkValue, transform) {
      return transform(currentLinkValue);
      }, initialLink);
  }

  return {
    run: run
  }
});


define('scribe-plugin-link-prompt-command',['./checks',
  './init',
  './prompts',
  './transforms'], function (checks, init, prompts, transforms) {


  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */

  

  return function (options) {
    var options = init.init(options);

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

        link = transforms.run(options.transforms.pre, link);

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

        if (link) {

          if (! checks.hasKnownProtocol(link) ) {
            link = prompts.process(window, link);
          }

          link = transforms.run(options.transforms.post, link);

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