define([
  '../../../api',
  '../../../api/selection'
], function (
  api
) {

  'use strict';

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (editable) {
      /**
       * We have to begin with the following HTML, because otherwise some
       * browsers(?) will position the caret outside of the P when the editor is
       * focused.
       */
       // Do not use `setHTML` method because we don't want to add to the
       // undo stack in this case.
      editable.el.innerHTML = '<p><br></p>';

      // TODO: move into separate patch

      /**
       * Chrome: press <enter> in a H2 / an empty LI creates DIV mode.
       */

      editable.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {

          var selection = new api.Selection();
          var range = selection.range;

          if (range.collapsed) {
            if (range.commonAncestorContainer.nodeName === 'LI'
              && range.commonAncestorContainer.innerHTML === '<br>') {
              /**
               * LIs
               */

              event.preventDefault();

              var pNode = document.createElement('p');
              var textNode = document.createTextNode(INVISIBLE_CHAR);
              pNode.appendChild(textNode);
              editable.el.insertBefore(pNode, range.commonAncestorContainer.nextSibling);
              range.commonAncestorContainer.remove();

              range.setStart(textNode, 0);
              range.setEnd(textNode, 0);

              selection.selection.removeAllRanges();
              selection.selection.addRange(range);

            } else if (range.commonAncestorContainer instanceof window.Text
              && /^(H[1-6])$/.test(range.commonAncestorContainer.parentNode.nodeName)) {
              /**
               * Heading elements
               */

              event.preventDefault();

              var pNode = document.createElement('p');
              var textNode = document.createTextNode(INVISIBLE_CHAR);
              pNode.appendChild(textNode);
              editable.el.insertBefore(pNode, range.commonAncestorContainer.nextElementSibling);

              // Re-apply range
              range.setStart(textNode, 0);
              range.setEnd(textNode, 0);

              selection.selection.removeAllRanges();
              selection.selection.addRange(range);

            }
          }
        }
      });
    };
  };

});
