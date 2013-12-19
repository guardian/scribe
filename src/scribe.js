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
    this.use(commands.outdent());
    this.use(commands.redo());
    this.use(commands.undo());

    this.use(shame());

    var pushHistoryOnFocus = function () {
      // Tabbing into the editor doesn't create a range immediately, so we have to
      // wait until the next event loop.
      setTimeout(function () {
        this.pushHistory();
      }.bind(this), 0);

      this.el.removeEventListener('focus', pushHistoryOnFocus);
    }.bind(this);

    this.el.addEventListener('focus', pushHistoryOnFocus);
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

  Scribe.prototype.setHTML = function (html) {
    this.el.innerHTML = html;
  };

  Scribe.prototype.getHTML = function () {
    return this.el.innerHTML;
  };

  Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
  };

  Scribe.prototype.pushHistory = function () {
    var selection = new Selection();

    var html;
    if (selection.range) {
      selection.placeMarkers();
      html = this.el.innerHTML;
      selection.removeMarkers(this.el);
    } else {
      html = this.el.innerHTML;
    }

    this.undoManager.push(html);
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

  // This will most likely be moved to another object eventually
  Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
  };

  Scribe.prototype.setContent = function (content) {
    if (! this.allowsBlockElements()) {
      // Bogus BR element for Firefox — see explanation in BR mode files.
      // TODO: also append when consumer sets the content manually.
      // TODO: hide when the user calls `getHTML`?
      content = content + '<br>';
    }

    this.setHTML(this.formatter.format(content));

    this.trigger('content-changed');
  };

  return Scribe;

});
