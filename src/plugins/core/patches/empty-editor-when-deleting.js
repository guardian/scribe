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

            /**
             * Chrome: With content "<h1>1</h1><p>2</p>", the `insertHTML` command
             * below will insert it *into* the `<h1>` element, instead of replacing it.
             * Even though we ask to select all the content in the editor.
             * As per: http://jsbin.com/unuJENI/1/edit?html,js,output
             *
             * This fix slightly confuses the behaviour of undo, but no content is lost
             * and it is easy to recover from.
             */
            var firstChild = editor.el.firstChild;
            if (firstChild.nodeName === 'H2') {
              var pNode = document.createElement('p');
              pNode.innerHTML = firstChild.innerHTML;
              editor.el.insertBefore(pNode, firstChild);
              firstChild.remove();
            }

            var contentRange = document.createRange();
            contentRange.selectNodeContents(editor.el);

            selection.removeAllRanges();
            selection.addRange(contentRange);

            // Doing things this way means we don't break the browser's undo manager.
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

    };
  };
});
