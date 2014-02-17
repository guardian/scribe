define(function () {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the browser
   * deletes the paragraph element, leaving the scribe in a pristine state.
   *
   * Firefox: Erasing the range created by ‘Select All’ will leave the scribe
   * in a pristine state.
   *
   * Entering a new line in a pristine state state will insert `<div>`s where
   * previously we had `<p>`'s. This patches the behaivour of delete/backspace
   * so that we do not end up in a pristine state.
   */

  'use strict';

  return function emptyEditorWhenDeleting() {
    return function (scribe) {

      scribe.el.addEventListener('keydown', function handleKeydown(event) {
        // Delete or backspace
        if (event.keyCode === 8 || event.keyCode === 46) {
          var selection = new scribe.api.Selection();

          /**
           * The second condition in this statement is only relevant for Firefox.
           * In Firefox, erasing the range created by ‘Select All’ will leave the
           * scribe in a pristine state. We polyfill this behaviour to match that of
           * Chrome: that is, to default to a paragraph element.
           *
           * This branch need not run in Chrome upon the second condition, but it does, for now.
           */

          var collapsedSelection = selection.selection.isCollapsed;
          var allContentSelected = isRangeAllContent(selection.range);

          if ((collapsedSelection && scribe.getTextContent().trim() === '') || (! collapsedSelection && allContentSelected)) {
            event.preventDefault();

            scribe.transactionManager.run(function () {
              scribe.setHTML('<p><em class="scribe-marker"></em><br></p>');
              selection.selectMarkers();
            });
          }
        }
      });

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
       * Takes a range and checks whether this range represents the whole
       * content.
       * @param  {Range} range
       * @return {Boolean}
       */
      function isRangeAllContent(range) {
        // To compare ranges, we serialise them into HTML strings and compare
        // them with the stricly equality operator.
        var serialisedSelection = serialiseRangeToHTML(range);

        var contentRange = document.createRange();
        contentRange.selectNodeContents(scribe.el);

        var serialisedContent = serialiseRangeToHTML(contentRange);

        return serialisedSelection === serialisedContent;
      }

    };
  };
});
