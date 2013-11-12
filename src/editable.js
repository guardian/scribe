define(function () {

  'use strict';

  function Editable(el) {
    if (!(this instanceof Editable)) return new Editable(el);
    this.el = el;
    this.context = document;

    this.el.setAttribute('contenteditable', true);
    /**
     * We have to begin with the following HTML, because otherwise some browsers(?) will
     * position the caret outside of the `p` element when the editor is focused.
     */
    this.html('<p><br></p>');

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
    function isAllContent(range) {
      // To compare ranges, we serialise them into HTML strings and compare them with
      // the stricly equality operator.
      var serialisedSelection = serialiseRangeToHTML(range);

      var contentRange = document.createRange();
      contentRange.selectNodeContents(el);

      var serialisedContent = serialiseRangeToHTML(contentRange);

      return serialisedSelection === serialisedContent;
    }

    // tinymce/util/Quirks: emptyEditorWhenDeleting

    function emptyEditorWhenDeleting(event) {
      // Delete or backspace
      if (event.keyCode === 8 || event.keyCode === 46) {
        var selection = window.getSelection();

        /**
         * The second condition in this statement is only relevant for Firefox.
         * In Firefox, erasing the range created by ‘Select All’ will leave the
         * editor in a pristine state. We polyfill this behaviour to match that of
         * Chrome: that is, to always default to a paragraph element.
         *
         * This branch need not run in Chrome upon the second condition, but it does, for now.
         */
        if (selection.isCollapsed && this.text() === '' ||
            ! selection.isCollapsed && isAllContent(getRange())) {
          event.preventDefault();

          var contentRange = document.createRange();
          contentRange.selectNodeContents(el);

          /**
           * TODO: Doing things this way means we don't break the browser's undo manager.
           * However, would this work if the editor didn't have focus? Can we afford
           * to give the editor focus every time this needs to be done?
           */
          // this.html('<p><br></p>');
          var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(contentRange);

          document.execCommand('insertHTML', false, '<p><br></p>');

          // TinyMce: setCursorLocation
          var node = this.el.querySelector('p');
          var range = getRange();
          range.setStart(node, 0);
          range.setEnd(node, 0);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }

    this.el.addEventListener('keydown', emptyEditorWhenDeleting.bind(this));
  }

  // For plugins
  Editable.prototype.use = function (fn) {
    fn(this);
    return this;
  };


  // Should this accept a node instead of HTML?
  Editable.prototype.html = function (html) {
    if (typeof html !== 'undefined') {
      this.el.innerHTML = html;
    }

    return this.el.innerHTML;
  };


  Editable.prototype.text = function (text) {
    return this.el.textContent.trim();
  };

  return Editable;

});
