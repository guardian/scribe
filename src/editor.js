define([
  'event-emitter',
  './initializers/root-paragraph-element',
  './plugins/core/formatters',
  './plugins/core/patches',
  './plugins/core/undo-manager-commands',
  './api',
  './api/undo-manager'
], function (
  EventEmitter,
  rootParagraphElement,
  formatters,
  patches,
  undoManagerCommands,
  api
) {

  'use strict';

  function Editor(el) {
    this.el = el;
    this.commands = {};
    this.patchedCommands = {};
    this.initializers = [];

    this.undoManager = new api.UndoManager();

    this.el.addEventListener('input', function () {
      this.pushHistory();
      this.trigger('content-changed');
    }.bind(this), false);

    /**
     * Plugins
     */

    // Core
    this.use(formatters());
    this.use(undoManagerCommands());

    // Patches
    this.use(patches.commands.bold());
    this.use(patches.commands.indent());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    this.use(patches.emptyEditorWhenDeleting());

    this.addInitializer(rootParagraphElement());

    this.el.setAttribute('contenteditable', true);

    this.initializers.forEach(function (initializer) {
      initializer(this);
    }, this);
  }

  Editor.prototype = Object.create(EventEmitter.prototype);

  // For plugins
  // TODO: tap combinator?
  Editor.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
  };

  Editor.prototype.addInitializer = function (initializer) {
    this.initializers.push(initializer);
    return this;
  };

  Editor.prototype.getHTML = function () {
    var selection = new api.Selection();

    var html;
    if (selection.range) {
      selection.placeMarkers();
      html = this.el.innerHTML;
      selection.removeMarkers(this.el);
    } else {
      html = this.el.innerHTML;
    }

    return html;
  };

  Editor.prototype.setHTML = function (html) {
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

  Editor.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem);

    // Restore the selection
    var selection = new api.Selection();
    selection.selectMarkers(this.el);

    this.trigger('content-changed');
  };

  return Editor;

});
