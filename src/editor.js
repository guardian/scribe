define([
  'event-emitter',
  './initializers/root-paragraph-element',
  './plugins/core/commands',
  './plugins/core/formatters',
  './plugins/core/patches',
  './plugins/core/shame',
  './api/command',
  './api/selection',
  './api/undo-manager'
], function (
  EventEmitter,
  rootParagraphElement,
  commands,
  formatters,
  patches,
  shame,
  Command,
  Selection,
  UndoManager
) {

  'use strict';

  function Editor(el, options) {
    this.el = el;
    this.commands = {};
    this.options = options || {};
    this.patchedCommands = {};
    this.initializers = [];

    this.undoManager = new UndoManager();

    this.el.addEventListener('input', function () {
      this.pushHistory();
      this.trigger('content-changed');
    }.bind(this), false);

    /**
     * Core Plugins
     */

    this.use(commands.insertList());
    this.use(commands.redo());
    this.use(commands.undo());

    this.use(formatters());

    // Patches
    this.use(patches.commands.bold());
    this.use(patches.commands.indent());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    this.use(patches.emptyEditorWhenDeleting());

    this.use(shame());


    if (this.options.paragraphs) {
      this.addInitializer(rootParagraphElement());
    }
  }

  Editor.prototype = Object.create(EventEmitter.prototype);

  Editor.prototype.initialize = function () {
    this.el.setAttribute('contenteditable', true);

    this.initializers.forEach(function (initializer) {
      initializer(this);
    }, this);
  };

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
    var selection = new Selection();

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
    return this.commands[commandName] || this.patchedCommands[commandName] || new Command(this, commandName);
  };

  Editor.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem);

    // Restore the selection
    var selection = new Selection();
    selection.selectMarkers(this.el);

    this.trigger('content-changed');
  };

  return Editor;

});
