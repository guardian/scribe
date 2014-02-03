define(['lodash-modern/collections/contains'], function (contains) {

  'use strict';

  return function () {
    return function (scribe) {
      // TODO: not exhaustive?
      var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H2'];
      function isBlockElement(node) {
        return contains(blockElementNames, node.nodeName);
      }

      var insertHTMLCommand = new scribe.api.Command('insertHTML');

      insertHTMLCommand.execute = function (value) {
        scribe.transactionManager.run(function () {
          var bin = document.createElement('div');
          bin.innerHTML = value;

          var binChildNodes = Array.prototype.slice.call(bin.childNodes);
          binChildNodes.forEach(function (binChildNode) {
            if (! isBlockElement(binChildNode)) {
              // TODO: wrap API
              var pElement = document.createElement('p');
              bin.insertBefore(pElement, binChildNode);
              pElement.appendChild(binChildNode);
            }
          });

          var newValue = bin.innerHTML;

          scribe.api.Command.prototype.execute.call(this, newValue);
        }.bind(this));
      };

      scribe.commands.insertHTML = insertHTMLCommand;
    };
  };

});
