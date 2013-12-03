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

  function Scribe(el, options) {
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

  Scribe.prototype = Object.create(EventEmitter.prototype);

  Scribe.prototype.initialize = function () {
    this.el.setAttribute('contenteditable', true);

    this.initializers.forEach(function (initializer) {
      initializer(this);
    }, this);
  };

  // For plugins
  // TODO: tap combinator?
  Scribe.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
  };

  Scribe.prototype.addInitializer = function (initializer) {
    this.initializers.push(initializer);
    return this;
  };

  Scribe.prototype.getHTML = function () {
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

  Scribe.prototype.setHTML = function (html) {
    this.el.innerHTML = html;
  };

  Scribe.prototype.text = function () {
    return this.el.textContent.trim();
  };

  Scribe.prototype.pushHistory = function () {
    this.undoManager.push(this.getHTML());
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.patchedCommands[commandName] || new Command(this, commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem);

    // Restore the selection
    var selection = new Selection();
    selection.selectMarkers(this.el);

    this.trigger('content-changed');
  };

  return Scribe;

});
