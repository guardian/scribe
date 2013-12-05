define([
  '../api/selection'
], function (
  Selection
) {

  'use strict';

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

    function removeSelectedTextNode() {
      var selection = new Selection();
      var container = selection.range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container.parentNode.removeChild(container);
      } else {
        throw new Error('Cannot empty non-text node!');
      }
    }

    function isUnorderedListChar(string) {
      return string === '*' || string === '-' || string === '•';
    }

    function findBlockContainer(node) {
      while (node && ! isBlockElement(node)) {
        node = node.parentNode;
      }

      return node;
    }

    function isBlockElement(node) {
      return (
        node.tagName === 'P' ||
        node.tagName === 'LI' ||
        node.tagName === 'DIV'
        // TODO: etc
      );
    }


    return function (scribe) {

      var preLastChar, lastChar, currentChar;

      function input(event) {
        var listCommand;

        preLastChar = lastChar;
        lastChar = currentChar;
        // FIXME: Chrome / FF, theoretically we should be using event.key?
        //        can we abstract this madness?
        currentChar = keys[event.keyCode || event.charCode];

        var selection = new Selection();

        // TODO: if a <p> with just this content
        var container = selection.range.commonAncestorContainer;

        // If in a <p>
        var blockContainer = findBlockContainer(container);
        if (blockContainer && blockContainer.tagName === 'P') {
          var startOfLineIsUList = isUnorderedListChar(container.textContent);
          if (isUnorderedListChar(lastChar) && currentChar === 'Space' && startOfLineIsUList) {
            listCommand = 'insertUnorderedList';
          }

          var startOfLineIsOList = container.textContent === '1.';
          if (preLastChar === '1' && lastChar === '.' && currentChar === 'Space' && startOfLineIsOList) {
            listCommand = 'insertOrderedList';
          }
        }

        if (listCommand) {
          // Ignore the typed character
          event.preventDefault();

          scribe.getCommand(listCommand).execute();

          // Clear "* "/etc from the list item
          removeSelectedTextNode();

          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      }

      scribe.el.addEventListener('keypress', input);
    };
  };

});
