define('scribe-plugin-smart-lists',[], function () {

  

  return function () {

    var keys = {
      32: 'Space',
      42: '*',
      45: '-',
      46: '.',
      49: '1',
      // Bullet insertion keycode, most likely only working on OS X...
      8226:  '•'
    };

    function isUnorderedListChar(string) {
      return string === '*' || string === '-' || string === '•';
    }

    return function (scribe) {

      var preLastChar, lastChar, currentChar;

      function findBlockContainer(node) {
        while (node && ! scribe.element.isBlockElement(node)) {
          node = node.parentNode;
        }

        return node;
      }

      function removeSelectedTextNode() {
        var selection = new scribe.api.Selection();
        var container = selection.selection.anchorNode;
        /**
         * Firefox: Selection object never gets access to text nodes, only
         * parent elements.
         * As per: http://jsbin.com/rotus/2/edit?js,output,console
         * Bugzilla: https://bugzilla.mozilla.org/show_bug.cgi?id=1042701
         */
        var textNode;
        if (container.nodeType === Node.TEXT_NODE) {
          textNode = container;
        } else if (container.firstChild.nodeType === Node.TEXT_NODE) {
          textNode = container.firstChild;
        }

        if (textNode) {
          var parentNode = textNode.parentNode;
          /**
           * Firefox: Given text of "1.", we sometimes have two text nodes
           * (why?): "1" and "."
           */
          if (textNode.previousSibling) {
            parentNode.removeChild(textNode.previousSibling);
          }
          parentNode.removeChild(textNode);
        } else {
          throw new Error('Cannot empty non-text node!');
        }
      }

      function input(event) {
        var listCommand;

        preLastChar = lastChar;
        lastChar = currentChar;
        // FIXME: Chrome / FF, theoretically we should be using event.key?
        //        can we abstract this madness?
        currentChar = keys[event.charCode];

        var selection = new scribe.api.Selection();

        // TODO: if a <p> with just this content
        var container = selection.range.commonAncestorContainer;

        // If in a <p>
        var blockContainer = findBlockContainer(container);
        if (blockContainer && blockContainer.tagName === 'P') {
          // Warning: There is no guarantee that `container` will be a text node
          // Failing Firefox tests

          var startOfLineIsUList = isUnorderedListChar(container.textContent[0]);
          var cursorIsInSecondPosition = selection.range.endOffset === 1;
          if (isUnorderedListChar(lastChar) && currentChar === 'Space' && startOfLineIsUList && cursorIsInSecondPosition) {
            listCommand = 'insertUnorderedList';
          }

          /**
           * Firefox: Selection object never gets access to text nodes, only
           * parent elements. This means that *sometimes* unordered lists
           * will not work.
           * As per: http://jsbin.com/rotus/2/edit?js,output,console
           * Bugzilla: https://bugzilla.mozilla.org/show_bug.cgi?id=1042701
           */

          // Some browsers split text nodes randomly, so we can't be sure the
          // prefix will be contained within a single text node (observed in
          // Firefox)
          var startOfLineIsOList = [
            container.previousSibling && container.previousSibling.textContent,
            container.textContent
          ].join('').slice(0, 2) === '1.';
          if (preLastChar === '1' && lastChar === '.' && currentChar === 'Space' && startOfLineIsOList) {
            listCommand = 'insertOrderedList';
          }
        }

        if (listCommand) {
          // Ignore the typed character
          event.preventDefault();

          scribe.transactionManager.run(function() {
            scribe.getCommand(listCommand).execute();

            // Clear "* "/etc from the list item
            removeSelectedTextNode();
          });
        }
      }

      scribe.el.addEventListener('keypress', input);
    };
  };

});


//# sourceMappingURL=scribe-plugin-smart-lists.js.map