define([
  '../api/selection'
], function (
  Selection
) {

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
      scribe.el.addEventListener('keypress', input);

      function input(event) {
        var curlyChar;

        // If previous char is real content, close quote; else, open
        // TODO: annoying Chrome/Firefox
        var currentChar = keys[event.keyCode || event.charCode];
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
        var selection = new Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.startOffset - 1];
      }

      function charAfterSelectedRange() {
        var selection = new Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.endOffset];
      }

      /** Delete any selected text, insert text instead */
      function replaceSelectedRangeWith(text) {
        var textNode = document.createTextNode(text);

        var selection = new Selection();
        selection.range.deleteContents();
        selection.range.insertNode(textNode);

        return textNode;
      }

      function placeCaretAfter(node) {
        var rangeAfter = new window.Range();
        rangeAfter.setStartAfter(node);
        rangeAfter.setEndAfter(node);

        var selection = new Selection();
        selection.selection.removeAllRanges();
        selection.selection.addRange(rangeAfter);
      }

    };
  };

});
