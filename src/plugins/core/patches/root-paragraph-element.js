define(['../../../api', '../../../api/range'], function (api) {

  'use strict';

  return function () {
    return function (editable) {
      /**
       * We have to begin with the following HTML, because otherwise some
       * browsers(?) will position the caret outside of the P when the editor is
       * focused.
       */
      editable.html('<p><br></p>');

      // TODO: move into separate patch

      /**
       * Chrome: press <enter> in a block element goes into DIV mode.
       * TODO: create isolated cases
       */

      editable.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {

          var range = new api.Range();

          if (range.collapsed) {
            if (range.commonAncestorContainer.nodeName === 'LI'
              && range.commonAncestorContainer.innerHTML === '<br>') {
              /**
               * We must not prevent the default event behaviour because this
               * would lead to the LI not being deleted. This does have the side
               * effect of creating an empty DIV.
               */
              setTimeout(function () {
                document.execCommand('insertHTML', null, '<p><br></p>');
              }, 0);
            } else if (range.commonAncestorContainer instanceof window.Text
              && range.commonAncestorContainer.parentNode.nodeName === 'H2') {
              // TODO: other block elements?
              event.preventDefault();
              document.execCommand('insertHTML', null, '<p><br></p>');
            }
          }
        }
      });
    };
  };

});
