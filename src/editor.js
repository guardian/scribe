define([
  'event-emitter',
  './plugins/core/formatters',
  './plugins/core/patches',
  './plugins/core/root-paragraph-element',
  './plugins/core/undo-manager-commands',
  './api',
  './api/undo-manager'
], function (
  EventEmitter,
  formatters,
  patches,
  rootParagraphElement,
  undoManagerCommands,
  api
) {

  'use strict';

  function Editor(el) {
    this.el = el;
    this.commands = {};
    this.patchedCommands = {};

    this.el.setAttribute('contenteditable', true);

    // Core
    this.use(formatters());
    this.use(rootParagraphElement());
    this.use(undoManagerCommands());

    // Patches
    this.use(patches.commands.bold());
    this.use(patches.commands.indent());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    this.use(patches.emptyEditorWhenDeleting());

    this.undoManager = new api.UndoManager();

    this.on('content-change', function () {
      this.pushHistory();
    });

    this.el.addEventListener('input', function () {
      this.trigger('content-change');
    }.bind(this), false);
  }

  Editor.prototype = Object.create(EventEmitter.prototype);

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
    return this.commands[commandName] || this.patchedCommands[commandName] || new api.Command(this, commandName);
  };

  return Editor;

});
