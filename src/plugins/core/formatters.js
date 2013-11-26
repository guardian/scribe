define([
  '../../api/selection'
], function (
  Selection
) {

  'use strict';

  return function () {
    return function (editor) {

      editor.formatters = [];

      /**
       * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
       * I also don't like how it has the authority to perform `event.preventDefault`.
       */

      editor.el.addEventListener('paste', function handlePaste(event) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * will execute the second branch here.
         */
        var data;
        if (event.clipboardData) {
          event.preventDefault();
          // TODO: what data should we be getting?
          data = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');

          formatAndInsert(data);
        } else {
          /**
           * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
           * sequence of events:
           *
           *   - Save the text selection
           *   - Focus another, hidden textarea so we paste there
           *   - Copy the pasted content of said textarea
           *   - Give focus back to the editor
           *   - Restore the text selection
           *
           * This is required because, without access to the Clipboard API, there is literally
           * no other way to manipulate content on paste.
           * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
           */

          var selection = new Selection();

          // Store the caret position
          selection.placeMarkers();

          var bin = document.createElement('div');
          document.body.appendChild(bin);
          bin.setAttribute('contenteditable', true);
          bin.focus();

          // Wait for the paste to happen (next loop?)
          setTimeout(function () {
            data = bin.innerHTML;
            bin.parentNode.removeChild(bin);

            // Restore the caret position
            selection.selectMarkers(editor.el);

            formatAndInsert(data);
          }, 1);
        }
      });

      function formatAndInsert(html) {
        var formattedHTML = editor.formatters.reduce(function (formattedData, formatter) {
          return formatter(formattedData);
        }, html);

        document.execCommand('insertHTML', null, formattedHTML);
      }

    };
  };

});
