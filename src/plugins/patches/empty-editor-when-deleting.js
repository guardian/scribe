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
    return function (editor) {

      editor.el.addEventListener('keydown', handleKeydown.bind(editor));

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

        var contentRange = document.createRange();
        contentRange.selectNodeContents(editor.el);

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
          if (selection.isCollapsed && editor.text() === '' ||
              ! selection.isCollapsed && isRangeAllContent(getRange())) {
            event.preventDefault();

            var contentRange = document.createRange();
            contentRange.selectNodeContents(editor.el);

            /**
             * TODO: Doing things this way means we don't break the browser's undo manager.
             * However, would this work if the editor didn't have focus? Can we afford
             * to give the editor focus every time this needs to be done?
             */
            // editor.html('<p><br></p>');
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(contentRange);

            document.execCommand('insertHTML', false, '<p><br></p>');

            var node = editor.el.querySelector('p');
            var range = getRange();
            range.setStart(node, 0);
            range.setEnd(node, 0);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }

    }
  }
})
