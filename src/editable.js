define([
  'plugins/core/formatters',
  'plugins/core/patches',
  'plugins/core/undo-manager'
], function (
  formatters,
  patches,
  undoManager
) {

  'use strict';

  function Editable(el) {
    this.el = el;
    this.commands = {};

    this.el.setAttribute('contenteditable', true);

    this.use(patches.boldCommand());
    this.use(patches.emptyEditorWhenDeleting());
    this.use(patches.rootParagraphElement());
    // TODO: pair with undoManager?
    this.use(patches.undoCommand());

    this.use(formatters());
    this.use(undoManager());
  }

  // For plugins
  // TODO: tap combinator?
  Editable.prototype.use = function (fn) {
    fn(this);
    return this;
  };


  // Should this accept a node instead of HTML?
  Editable.prototype.html = function (html) {
    if (html) {
      this.el.innerHTML = html;
    }

    return this.el.innerHTML;
  };


  Editable.prototype.text = function () {
    return this.el.textContent.trim();
  };

  return Editable;

});
