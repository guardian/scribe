define([
  './plugins/core/plugins',
  './plugins/core/commands',
  './plugins/core/formatters',
  './plugins/core/events',
  './plugins/core/patches',
  './formatter-factory',
  './html-formatter-factory',
  './api',
  './transaction-manager',
  './undo-manager',
  './event-emitter',
  './node',
  'immutable/dist/immutable',
  './config'
], function (
  plugins,
  commands,
  formatters,
  events,
  patches,
  FormatterFactory,
  HTMLFormatterFactory,
  Api,
  TransactionManager,
  UndoManager,
  EventEmitter,
  nodeHelpers,
  Immutable,
  config
) {

  'use strict';

  function Scribe(el, options) {
    EventEmitter.call(this);

    this.el = el;
    this.commands = {};

    this.options = config.checkOptions(options);

    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();

    this.api = new Api(this);
    this.transactionManager = new TransactionManager(this);

    this.Immutable = Immutable;

    //added for explicit checking later eg if (scribe.undoManager) { ... }
    this.undoManager = false;
    if (this.options.undo.enabled) {
      if (this.options.undo.manager) {
        this.undoManager = this.options.undo.manager;
      }
      else {
        this.undoManager = new UndoManager(this.options.undo.limit, this.el);
      }
      this._merge = false;
      this._forceMerge = false;
      this._mergeTimer = 0;
      this._lastItem = {content: ''};
    }

    this.setHTML(this.getHTML());

    this.el.contentEditable = true;
    this.el.addEventListener('input', this, false);

    // Core Plugins
    var corePlugins = Immutable.OrderedSet(this.options.defaultPlugins)
      .sort(config.sortByPlugin('setRootPElement')) // Ensure `setRootPElement` is always loaded first
      .filter(config.filterByBlockLevelMode(this.allowsBlockElements()))
      .map(function (plugin) { return plugins[plugin]; });

    // Formatters
    var defaultFormatters = Immutable.List(this.options.defaultFormatters)
      .filter(function (formatter) { return !!formatters[formatter]; })
      .map(function (formatter) { return formatters[formatter]; });

    // Patches
    var defaultPatches = Immutable.List.of(patches.events);

    // Commands
    var defaultCommands = Immutable.List.of(
      'indent',
      'insertList',
      'outdent',
      'redo',
      'subscript',
      'superscript',
      'undo'
    ).map(function(command) { return commands[command]; });

    // Command patches
    var defaultCommandPatches = Immutable.List(this.options.defaultCommandPatches)
      .map(function(patch) { return patches.commands[patch]; });

    corePlugins.concat(
      defaultFormatters,
      defaultPatches,
      defaultCommandPatches,
      defaultCommands
    ).forEach(function(plugin) {
      this.use(plugin());
    }.bind(this));

    this.use(events());
  }

  Scribe.prototype = Object.create(EventEmitter.prototype);

  Scribe.prototype.node = nodeHelpers;

  Scribe.prototype.handleEvent = function() {
    this.transactionManager.run();
  }

  Scribe.prototype.use = function(plugin) {
    plugin(this);
  }

  Scribe.prototype.setHTML = function (html, skipFormatters) {
    if( this.options.undo.enabled ) {
      this._lastItem.content = html;
    }

    if (skipFormatters) {
      this._skipFormatters = true;
    }
    // IE11: Setting HTML to the value it already has causes breakages elsewhere (see #336)
    if (this.el.innerHTML !== html) {
      this.el.innerHTML = html;
    }
  };

  Scribe.prototype.getHTML = function () {
    return this.el.innerHTML;
  };

  Scribe.prototype.getContent = function () {
    // Remove bogus BR element for Firefox — see explanation in BR mode files.
    return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
  };

  Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
  };

  Scribe.prototype.pushHistory = function () {
    /**
     * Chrome and Firefox: If we did push to the history, this would break
     * browser magic around `Document.queryCommandState` (http://jsbin.com/eDOxacI/1/edit?js,console,output).
     * This happens when doing any DOM manipulation.
     */

    if (! this.options.undo.enabled ) {
      return false;
    }

    // We only want to push the history if the content actually changed.
    if (this.getHTML() === scribe._lastItem.content.replace('<em class="scribe-marker"></em>', '')) {
      return false;
    }

    var selection = new scribe.api.Selection();
    selection.placeMarkers();
    var content = scribe.getHTML();
    selection.removeMarkers();

    // Checking if there is a need to merge, and that the previous history item
    // is the last history item of the same scribe instance.
    // It is possible the last transaction is not for the same instance, or
    // even not a scribe transaction (e.g. when using a shared undo manager).
    var previousItem = this.undoManager.item(this.undoManager.position);
    if ((this._merge || this._forceMerge) && previousItem && this._lastItem == previousItem[0]) {
      // If so, merge manually with the last item to save more memory space.
      this._lastItem.content = content;
    }
    else {
      // Otherwise, create a new history item, and register it as a new transaction
      this._lastItem = {
        previousItem: this._lastItem,
        content: content,
        scribe: this,
        execute: function () { },
        undo: function () { this.scribe.restoreFromHistory(this.previousItem); },
        redo: function () { this.scribe.restoreFromHistory(this); }
      };

      this.undoManager.transact(this._lastItem, false);
    }

    // Merge next transaction if it happens before the interval option, otherwise don't merge.
    clearTimeout(this._mergeTimer);
    scribe._merge = true;
    scribe._mergeTimer = setTimeout(
      function() { this._merge = false; }.bind(this),
      this.options.undo.interval
    );

    return true;
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    if( this.options.undo.enabled ) {
      this._lastItem = historyItem;
    }

    this.setHTML(historyItem.content, true);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers();

    // Because we skip the formatters, a transaction is not run, so we have to
    // emit this event ourselves.
    this.trigger('content-changed');
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] ||
      this.commandPatches[commandName] ||
      new this.api.Command(commandName);
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

    this.setHTML(content);

    this.trigger('content-changed');
  };

  Scribe.prototype.insertPlainText = function (plainText) {
    this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
  };

  Scribe.prototype.insertHTML = function (html) {
    /**
     * When pasting text from Google Docs in both Chrome and Firefox,
     * the resulting text will be wrapped in a B tag. So it would look
     * something like <b><p>Text</p></b>, which is invalid HTML. The command
     * insertHTML will then attempt to fix this content by moving the B tag
     * inside the P. The result is: <p><b></b></p><p>Text</p>, which is valid
     * but means an extra P is inserted into the text. To avoid this we run the
     * formatters before the insertHTML command as the formatter will
     * unwrap the P and delete the B tag. It is acceptable to remove invalid
     * HTML as Scribe should only accept valid HTML.
     *
     * See http://jsbin.com/cayosada/3/edit for more
     **/

    // TODO: error if the selection is not within the Scribe instance? Or
    // focus the Scribe instance if it is not already focused?
    this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
  };

  Scribe.prototype.isDebugModeEnabled = function () {
    return this.options.debug;
  };

  /**
   * Applies HTML formatting to all editor text.
   * @param {String} phase sanitize/normalize/export are the standard phases
   * @param {Function} fn Function that takes the current editor HTML and returns a formatted version.
   */
  Scribe.prototype.registerHTMLFormatter = function (phase, formatter) {
    this._htmlFormatterFactory.register(phase, formatter);
  };

  Scribe.prototype.registerPlainTextFormatter = function (formatter) {
    this._plainTextFormatterFactory.register(formatter);
  };


  return Scribe;

});
