define(function () {

  /**
   * Adds a command for using CODEs.
   */

  'use strict';

  return function () {
    return function (scribe) {
      var codeCommand = new scribe.api.SimpleCommand('code', 'CODE');

      codeCommand.execute = function () {
        scribe.transactionManager.run(function () {
          // TODO: When this command supports all types of ranges we can abstract
          // it and use it for any command that applies inline styles.
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var selectedHtmlDocumentFragment = range.extractContents();

          var codeElement = document.createElement('code');
          codeElement.appendChild(selectedHtmlDocumentFragment);

          range.insertNode(codeElement);

          range.selectNode(codeElement);

          // Re-apply the range
          selection.selection.removeAllRanges();
          selection.selection.addRange(range);
        });
      };

      // There is no native command for CODE elements, so we have to provide
      // our own `queryState` method.
      // TODO: Find a way to make it explicit what the sequence of commands will
      // be.
      codeCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      // There is no native command for CODE elements, so we have to provide
      // our own `queryEnabled` method.
      // TODO: Find a way to make it explicit what the sequence of commands will
      // be.
      codeCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        var range = selection.range;

        // TODO: Support uncollapsed ranges
        return ! range.collapsed;
      };

      scribe.commands.code = codeCommand;
    };
  };

});
