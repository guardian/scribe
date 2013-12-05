define([
  'event-emitter',
  './initializers/root-paragraph-element',
  './initializers/insert-br-on-return',
  './plugins/core/commands',
  './plugins/core/formatters',
  './plugins/core/patches',
  './plugins/core/shame',
  './api/command',
  './api/selection',
  './api/undo-manager',
  'lodash-modern/objects/defaults'
], function (
  EventEmitter,
  rootParagraphElement,
  insertBrOnReturn,
  commands,
  formatters,
  patches,
  shame,
  Command,
  Selection,
  UndoManager,
  defaults
) {

  'use strict';

  function Scribe(el, options) {
    this.el = el;
    this.commands = {};
    this.options = defaults(options || {}, {
      allowBlockElements: true
    });
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

    // FIXME: event order matters
    if (this.allowsBlockElements()) {
      // P mode
      this.addInitializer(rootParagraphElement());
    } else {
      // BR mode
      this.addInitializer(insertBrOnReturn());
    }

    this.use(formatters());

    // Patches
    this.use(patches.commands.bold());
    this.use(patches.commands.indent());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    if (this.allowsBlockElements()) {
      this.use(patches.emptyWhenDeleting());
    }

    this.use(commands.insertList());
    this.use(commands.redo());
    this.use(commands.undo());

    this.use(shame());
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

    this.pushHistory();
    this.trigger('content-changed');
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
    this.el.innerHTML = historyItem;

    // Restore the selection
    var selection = new Selection();
    selection.selectMarkers(this.el);

    this.trigger('content-changed');
  };

  // This will most likely be moved to another object eventually
  Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
  };

  return Scribe;

});
