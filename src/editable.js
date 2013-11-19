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

  function Editable(el) {
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
  Editable.prototype.use = function (fn) {
    fn(this);
    return this;
  };


  Editable.prototype.getHTML = function () {
    var selection = new api.Selection();

    selection.placeMarkers();
    var html = this.el.innerHTML;
    selection.removeMarkers(this.el);

    return html;
  };

  Editable.prototype.setHTML = function (html) {
    this.pushHistory();
    this.el.innerHTML = html;
  };

  Editable.prototype.text = function () {
    return this.el.textContent.trim();
  };

  Editable.prototype.execCommand = function (commandName, value) {
    var patchedCommand = this.patchedCommands[commandName];
    if (patchedCommand) {
      patchedCommand(value);
    } else {
      document.execCommand(commandName, false, value || null);
    }
  };

  Editable.prototype.pushHistory = function () {
    this.undoManager.push(this.getHTML());
  };

  return Editable;

});
