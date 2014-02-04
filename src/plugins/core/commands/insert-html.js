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
        if (scribe.allowsBlockElements()) {
          /**
           * Ensure P mode.
           *
           * Wrap any orphan text nodes in a P element.
           */
          // TODO: This should be configurable and also correct markup such as
          // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
          // TODO: This should probably be a part of HTML Janitor, or some other
          // formatter.
          scribe.transactionManager.run(function () {
            var bin = document.createElement('div');
            bin.innerHTML = value;

            traverse(bin);

            var newValue = bin.innerHTML;

            scribe.api.Command.prototype.execute.call(this, newValue);

            function traverse(parentNode) {
              var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
              var node = treeWalker.firstChild();
              var isUnderTopContainerElement = ! parentNode.parentNode;

              while (node) {
                var isUnderBlockElement = new scribe.api.Node(node).getAncestor(function (node) {
                  return isBlockElement(node);
                });

                if (! isBlockElement(node)
                    && (parentNode.nodeName === 'BLOCKQUOTE'
                        || ! isUnderBlockElement
                        || isUnderTopContainerElement)) {
                  // TODO: wrap API
                  var pElement = document.createElement('p');
                  parentNode.insertBefore(pElement, node);
                  pElement.appendChild(node);
                  // We break this loop and start the traverse again from the
                  // parent node, because changing the DOM as above breaks the
                  // tree walker.
                  traverse(parentNode);
                  break;
                } else {
                  traverse(node);
                }

                node = treeWalker.nextSibling();
              }
            }
          }.bind(this));
        } else {
          scribe.api.Command.prototype.execute.call(this, value);
        }
      };

      scribe.commands.insertHTML = insertHTMLCommand;
    };
  };

});
