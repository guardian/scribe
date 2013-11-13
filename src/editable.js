define([
  'plugins/core/patches',
], function (
  patches
) {

  'use strict';

  function Editable(el) {
    this.el = el;
    this.commands = {};

    this.el.setAttribute('contenteditable', true);

    this.use(patches.boldCommand());
    this.use(patches.emptyEditorWhenDeleting());
    this.use(patches.rootParagraphElement());
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
