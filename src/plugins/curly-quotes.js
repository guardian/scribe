define(function () {

  'use strict';

  return function () {

    var keys = {
      34: '"',
      39: '\''
    };

    var openDoubleCurly = '“';
    var closeDoubleCurly = '”';

    var openSingleCurly = '‘';
    var closeSingleCurly = '’';

    var NON_BREAKING_SPACE = '\u00A0';

    return function (scribe) {
      // Substitute quotes while typing
      scribe.el.addEventListener('keypress', input);

      // Substitute quotes on setting content or paste
      scribe.formatter.formatters.push(substituteCurlyQuotes);

      function input(event) {
        var curlyChar;

        // If previous char is real content, close quote; else, open
        // TODO: annoying Chrome/Firefox
        var currentChar = keys[event.charCode];
        if (currentChar === '"') {
          if (wordBeforeSelectedRange()) {
            curlyChar = closeDoubleCurly;
          } else {
            curlyChar = openDoubleCurly;
          }
        } else if (currentChar === '\'') {
          if (wordBeforeSelectedRange()) {
            curlyChar = closeSingleCurly;
          } else {
            curlyChar = openSingleCurly;
          }
        }

        // Substitute entered char with curly replacement
        if (curlyChar) {
          event.preventDefault();

          var quoteText = replaceSelectedRangeWith(curlyChar);
          placeCaretAfter(quoteText);

          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      }

      function wordBeforeSelectedRange() {
        var prevChar = charBeforeSelectedRange();
        return (
          prevChar !== ' ' &&
          prevChar !== NON_BREAKING_SPACE &&
          typeof prevChar !== 'undefined'
        );
      }

      function charBeforeSelectedRange() {
        var selection = new scribe.api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.startOffset - 1];
      }

      function charAfterSelectedRange() {
        var selection = new scribe.api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.endOffset];
      }

      /** Delete any selected text, insert text instead */
      function replaceSelectedRangeWith(text) {
        var textNode = document.createTextNode(text);

        var selection = new scribe.api.Selection();
        selection.range.deleteContents();
        selection.range.insertNode(textNode);

        return textNode;
      }

      function placeCaretAfter(node) {
        var rangeAfter = document.createRange();
        rangeAfter.setStartAfter(node);
        rangeAfter.setEndAfter(node);

        var selection = new scribe.api.Selection();
        selection.selection.removeAllRanges();
        selection.selection.addRange(rangeAfter);
      }

      function substituteCurlyQuotes(html) {
        // We don't want to replace quotes within the HTML markup
        // (e.g. attributes), only to text nodes
        var holder = document.createElement('div');
        holder.innerHTML = html;

        // Replace straight single and double quotes with curly
        // equivalent in the given string
        mapTextNodes(holder, function(str) {
          return str.
            replace(/([^\s])"/g, '$1' + closeDoubleCurly).
            replace(/"/g, openDoubleCurly).
            replace(/([^\s])'/g, '$1' + closeSingleCurly).
            replace(/'/g, openSingleCurly);
        });

        return holder.innerHTML;
      }

      // Apply a function on all text nodes in a container, mutating in place
      function mapTextNodes(container, func) {
        var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        var node = walker.firstChild();
        if (node) {
          do {
            node.data = func(node.data);
          } while ((node = walker.nextSibling()));
        }

        return node;
      }

    };
  };

});
