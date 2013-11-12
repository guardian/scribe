define([
  'plugins/core/patches/empty-editor-when-deleting',
], function (
  emptyEditorWhenDeleting
) {

  'use strict';

  function Editable(el) {
    this.el = el;
    this.context = document;
    // TODO: put on prototype?
    this.commands = {};

    this.el.setAttribute('contenteditable', true);

    /**
     * We have to begin with the following HTML, because otherwise some browsers(?) will
     * position the caret outside of the `p` element when the editor is focused.
     */
    this.html('<p><br></p>');

    this.use(emptyEditorWhenDeleting());
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


  Editable.prototype.text = function () {
    return this.el.textContent.trim();
  };

  return Editable;

});
