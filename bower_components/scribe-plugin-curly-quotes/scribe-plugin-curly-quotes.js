define('scribe-plugin-curly-quotes',[],function () {

  

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
      scribe.registerHTMLFormatter('normalize', substituteCurlyQuotes);

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

          scribe.transactionManager.run(function() {
            var quoteText = replaceSelectedRangeWith(curlyChar);
            placeCaretAfter(quoteText);
          });
        }
      }

      function wordBeforeSelectedRange() {
        var prevChar = charBeforeSelectedRange() || '';
        return isWordCharacter(prevChar);
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

      function isWordCharacter(character) {
          return /[^\s()]/.test(character);
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
          // Tokenise HTML elements vs text between them
          // Note: this is escaped HTML in the text node!
          var tokens = str.split(/(<[^>]+?>)/);
          return tokens.map(function(token) {
            // Only replace quotes in text between (potential) HTML elements
            if (token[0] === '<') {
              return token;
            } else {
              return token.
                // Use [\s\S] instead of . to match any characters _including newlines_
                replace(/([\s\S])?'([\s\S])?/g,
                        replaceQuotesFromContext(openSingleCurly, closeSingleCurly)).
                replace(/([\s\S])?"([\s\S])?/g,
                        replaceQuotesFromContext(openDoubleCurly, closeDoubleCurly));
            }
          }).join('');
        });

        return holder.innerHTML;
      }

      function replaceQuotesFromContext(openCurly, closeCurly) {
        return function(m, prev, next) {
          prev = prev || '';
          next = next || '';
          var isStart = ! prev;
          var isEnd = ! next;
          var hasCharsBefore = isWordCharacter(prev);
          var hasCharsAfter  = isWordCharacter(next);
          // Optimistic heuristic, would need to look at DOM structure
          // (esp block vs inline elements) for more robust inference
          if (hasCharsBefore || (isStart && ! hasCharsAfter && ! isEnd)) {
            return prev + closeCurly + next;
          } else {
            return prev + openCurly + next;
          }
        };
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

//# sourceMappingURL=scribe-plugin-curly-quotes.js.map