define([
  'event-emitter',
  'lodash-modern/objects/defaults',
  './initializers/root-paragraph-element',
  './initializers/insert-br-on-return',
  './plugins/core/commands',
  './plugins/core/formatters',
  './plugins/core/patches',
  './plugins/core/shame',
  './api',
], function (
  EventEmitter,
  defaults,
  rootParagraphElement,
  insertBrOnReturn,
  commands,
  formatters,
  patches,
  shame,
  Api
) {

  'use strict';

  function Scribe(el, options) {
    this.el = el;
    this.commands = {};
    this.options = defaults(options || {}, {
      allowBlockElements: true
    });
    this.commandPatches = {};
    this.initializers = [];

    this.api = new Api(this);

    this.undoManager = new this.api.UndoManager();

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

    this.use(commands.indent());
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

  Scribe.prototype.getContent = function () {
    // Remove bogus BR element for Firefox — see explanation in BR mode files.
    return this.getHTML().replace(/<br>$/, '');
  };

  Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
  };

  Scribe.prototype.pushHistory = function () {
    var selection = new this.api.Selection();

    var html;
    selection.placeMarkers();
    html = this.el.innerHTML;
    selection.removeMarkers(this.el);

    this.undoManager.push(html);
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers(this.el);

    this.trigger('content-changed');
  };

  // This will most likely be moved to another object eventually
  Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
  };

  Scribe.prototype.setContent = function (content) {
    if (! this.allowsBlockElements()) {
      // Set bogus BR element for Firefox — see explanation in BR mode files.
      content = content + '<br>';
    }

    this.setHTML(this.formatter.format(content));

    this.trigger('content-changed');
  };

  return Scribe;

});
