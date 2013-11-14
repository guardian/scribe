define(function () {

  'use strict';

  /**
   * Chrome and Firefox: Upon pressing backspace with a state of `<p>|</p>`, the
   * browser deletes the paragraph element, leaving the editor in a pristine state.
   *
   * Firefox: Erasing the range created by ‘Select All’ will leave the editor in a
   * pristine state.
   *
   * Entering a new line in a pristine state state will insert `<div>`s where
   * previously we had `<p>`'s. This patches the behaivour of delete/backspace
   * so that we do not end up in a pristine state.
   */

  return function emptyEditorWhenDeleting() {
    return function (editable) {

      editable.el.addEventListener('keydown', handleKeydown.bind(editable));

      /**
       * Get the current range.
       * @return {Range}
       */
      function getRange() {
        var selection = window.getSelection();
        return selection.getRangeAt(0);
      }

      /**
       * Serialise a range into a HTML string.
       * @param  {Range} range
       * @return {string}
       */
      function serialiseRangeToHTML(range) {
        var div = document.createElement('div');
        var contents = range.cloneContents();
        div.appendChild(contents);
        return div.innerHTML;
      }

      /**
       * Takes a range and checks whether this range represents the whole content.
       * @param  {Range}  range
       * @return {Boolean}
       */
      function isRangeAllContent(range) {
        // To compare ranges, we serialise them into HTML strings and compare them with
        // the stricly equality operator.
        var serialisedSelection = serialiseRangeToHTML(range);

        var contentRange = new window.Range();
        contentRange.selectNodeContents(editable.el);

        var serialisedContent = serialiseRangeToHTML(contentRange);

        return serialisedSelection === serialisedContent;
      }

      function handleKeydown(event) {
        // Delete or backspace
        if (event.keyCode === 8 || event.keyCode === 46) {
          var selection = window.getSelection();

          /**
           * The second condition in this statement is only relevant for Firefox.
           * In Firefox, erasing the range created by ‘Select All’ will leave the
           * editor in a pristine state. We polyfill this behaviour to match that of
           * Chrome: that is, to default to a paragraph element.
           *
           * This branch need not run in Chrome upon the second condition, but it does, for now.
           */
          if (selection.isCollapsed && editable.text() === '' ||
              ! selection.isCollapsed && isRangeAllContent(getRange())) {
            event.preventDefault();

            /**
             * Chrome: Even with everything selected, in Chrome `insertHTML` does
             * not replace the whole selection.
             * As per: http://jsbin.com/elicInov/2/edit?html,js,output
             *
             * Chrome: The first delete will only remove the contents of the
             * blockquote. Deleting twice works but adds more to the undo stack.
             */

            var contentRange = document.createRange();
            contentRange.selectNodeContents(editable.el);

            selection.removeAllRanges();
            selection.addRange(contentRange);

            // Doing it this way means we don't break undo.

            // TODO: write polyfill for `insertHTML` to do this for us.
            document.execCommand('delete');
            document.execCommand('delete');
            document.execCommand('insertHTML', false, '<p><br></p>');

            var node = editable.el.querySelector('p');
            var range = getRange();
            range.setStart(node, 0);
            range.setEnd(node, 0);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }

    };
  };
});
