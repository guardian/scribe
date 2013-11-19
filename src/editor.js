define([
  './plugins/core/formatters',
  './plugins/core/patches',
  './api',
  './api/undo-manager'
], function (
  formatters,
  patches,
  api
) {

  'use strict';

  function Editor(el) {
    this.el = el;
    this.commands = {};
    this.patchedCommands = {};

    this.el.setAttribute('contenteditable', true);

    this.use(patches.boldCommand());
    this.use(patches.emptyEditorWhenDeleting());
    this.use(patches.indentCommand());
    this.use(patches.insertListCommands());
    this.use(patches.outdentCommand());
    this.use(patches.rootParagraphElement());
    this.use(patches.undoManagerCommands());

    this.use(formatters());

    this.undoManager = new api.UndoManager();

    this.el.addEventListener('input', function () {
      this.pushHistory();
    }.bind(this), false);
  }

  // For plugins
  // TODO: tap combinator?
  Editor.prototype.use = function (fn) {
    fn(this);
    return this;
  };


  Editor.prototype.getHTML = function () {
    var selection = new api.Selection();

    selection.placeMarkers();
    var html = this.el.innerHTML;
    selection.removeMarkers(this.el);

    return html;
  };

  Editor.prototype.setHTML = function (html) {
    this.pushHistory();
    this.el.innerHTML = html;
  };

  Editor.prototype.text = function () {
    return this.el.textContent.trim();
  };

  Editor.prototype.pushHistory = function () {
    this.undoManager.push(this.getHTML());
  };

  Editor.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || new api.Command(this, commandName);
  };

  return Editor;

});
