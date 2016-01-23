define('constants',[], function () {
  return {
    openDoubleCurly: '“',
    closeDoubleCurly: '”',
    openSingleCurly: '‘',
    closeSingleCurly: '’'
  }
});

define('formatters',['./constants'], function (constants) {

  function isWordCharacter(character) {
      return /[^\s()]/.test(character);
  }

  function replaceQuotesFromContext(openCurly, closeCurly) {
    return function(m, prev) {
      prev = prev || '';
      var hasCharsBefore = isWordCharacter(prev);
      // Optimistic heuristic, would need to look at DOM structure
      // (esp block vs inline elements) for more robust inference
      if (hasCharsBefore) {
        return prev + closeCurly;
      } else {
        return prev + openCurly;
      }
    };
  }

  // Recursively convert the quotes to curly quotes. We have to do this
  // recursively instead of with a global match because the latter would
  // not detect overlaps, e.g. "'1'" (text can only be matched once).
  function convert(str) {
    if (! /['"]/.test(str)) {
      return str;
    } else {
      var foo = str.
        // Use [\s\S] instead of . to match any characters _including newlines_
        replace(/([\s\S])?'/,
                replaceQuotesFromContext(constants.openSingleCurly, constants.closeSingleCurly)).
        replace(/([\s\S])?"/,
                replaceQuotesFromContext(constants.openDoubleCurly, constants.closeDoubleCurly));
      return convert(foo);
    }
  }

  return {
    convert: convert
  }
});

define('arrays',[], function() {

  function toArray(nodeList) {
    var array = [];
    if (nodeList && nodeList.length && nodeList.item) {
      for (var i = 0; i < nodeList.length; i++) {
        var item = nodeList.item(i);
        if (item) {
          array.push(item);
        }
      }
    }
    return array;
  }

  return {
    toArray: toArray
  };
});

define('scribe-plugin-curly-quotes',[
  './constants',
  './formatters',
  './arrays'
], function (
  constants,
  formatters,
  arrays
) {

  

  return function () {

    return function (scribe) {
      /**
       * Run the formatter as you type on the current paragraph.
       *
       * FIXME: We wouldn't have to do this if the formatters were run on text
       * node mutations, but that's expensive unil we have a virtual DOM.
       */

      var curlyQuoteChar;

      var elementHelpers = scribe.node;

      // `input` doesn't tell us what key was pressed, so we grab it beforehand
      scribe.el.addEventListener('keypress', function (event) {
        var keys = {
          34: '"',
          39: '\''
        };

        curlyQuoteChar = keys[event.charCode];
      });

      // When the character is actually inserted, format it to transform.
      scribe.el.addEventListener('input', function () {
        if (curlyQuoteChar) {
          var selection = new scribe.api.Selection();
          var containingBlockElement = scribe.allowsBlockElements()
            ? selection.getContaining(elementHelpers.isBlockElement)
            : scribe.el;

          selection.placeMarkers();
          containingBlockElement.innerHTML = substituteCurlyQuotes(containingBlockElement.innerHTML);
          selection.selectMarkers();
          // Reset
          curlyQuoteChar = undefined;
        }
      });

      // Substitute quotes on setting content or paste
      scribe.registerHTMLFormatter('normalize', substituteCurlyQuotes);

      function substituteCurlyQuotes(html) {
        // We don't want to replace quotes within the HTML markup
        // (e.g. attributes), only to text nodes
        var holder = document.createElement('div');
        holder.innerHTML = html;

        // Replace straight single and double quotes with curly
        // equivalent in the given string
        mapElements(holder, function(prev, str) {
          // Tokenise HTML elements vs text between them
          // Note: this is escaped HTML in the text node!
          // Split by elements
          // We tokenise with the previous text nodes for context, but
          // only extract the current text node.
          var tokens = (prev + str).split(/(<[^>]+?>(?:.*<\/[^>]+?>)?)/);
          return tokens
            .map(function(token) {
              // Only replace quotes in text between (potential) HTML elements
              if (/^</.test(token)) {
                return token;
              } else {
                return formatters.convert(token);
              }
            })
            .join('')
            .slice(prev.length);
        });

        return holder.innerHTML;
      }

      // Apply a function on all text nodes in a container, mutating in place
      function mapElements(containerElement, func) {
        // TODO: This heuristic breaks for elements that contain a mixture of
        // inline and block elements.
        var nestedBlockElements = arrays.toArray(containerElement.children).filter(elementHelpers.isBlockElement);
        if (nestedBlockElements.length) {
          nestedBlockElements.forEach(function (nestedBlockElement) {
            // Map the nested block elements
            mapElements(nestedBlockElement, func);
          });
        } else {
          mapTextNodes(containerElement, func);
        }
      }

      function mapTextNodes(containerElement, func) {
        // TODO: Only walk inside of text nodes within inline elements
        var walker = document.createTreeWalker(containerElement, NodeFilter.SHOW_TEXT);
        var node = walker.firstChild();
        var prevTextNodes = '';
        while (node) {
          // Split by BR
          if (node.previousSibling && node.previousSibling.nodeName === 'BR') {
            prevTextNodes = '';
          }
          node.data = func(prevTextNodes, node.data);
          prevTextNodes += node.data;
          node = walker.nextSibling();
        }
      }

    };
  };

});


//# sourceMappingURL=scribe-plugin-curly-quotes.js.map