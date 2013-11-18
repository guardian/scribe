define([
  '../../../api',
  '../../../api/selection',
], function (
  api
) {

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
          var selection = new api.Selection();

          /**
           * The second condition in this statement is only relevant for Firefox.
           * In Firefox, erasing the range created by ‘Select All’ will leave the
           * editor in a pristine state. We polyfill this behaviour to match that of
           * Chrome: that is, to default to a paragraph element.
           *
           * This branch need not run in Chrome upon the second condition, but it does, for now.
           */

          if (selection.selection.isCollapsed && editable.text() === '' ||
              ! selection.selection.isCollapsed && isRangeAllContent(selection.range)) {
            event.preventDefault();
            editable.setHTML('<p><em class="editor-marker"></em><br /></p>');
            selection.selectMarkers(editable.el);
          }
        }
      }

    };
  };
});
