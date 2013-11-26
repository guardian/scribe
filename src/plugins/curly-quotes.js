define([
  '../api',
  '../api/selection'
], function (
  api
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
    var apostropheCurly = '';

    var NON_BREAKING_SPACE = '\u00A0';

    return function (editor) {
      editor.el.addEventListener('keypress', input);

      function input(event) {
        var curlyChar;

        // If previous char is real content, close quote; else, open
        var currentChar = keys[event.keyCode];
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
        var selection = new api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.startOffset - 1];
      }

      function charAfterSelectedRange() {
        var selection = new api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.endOffset];
      }

      /** Delete any selected text, insert text instead */
      function replaceSelectedRangeWith(text) {
        var textNode = document.createTextNode(text);

        var selection = new api.Selection();
        selection.range.deleteContents();
        selection.range.insertNode(textNode);

        editor.pushHistory();
        editor.trigger('content-changed');

        return textNode;
      }

      function placeCaretAfter(node) {
        var rangeAfter = document.createRange();
        rangeAfter.setStartAfter(node);
        rangeAfter.setEndAfter(node);

        var selection = new api.Selection();
        selection.selection.removeAllRanges();
        selection.selection.addRange(rangeAfter);
      }

    };
  };

});
