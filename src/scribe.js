define([
  'lodash-amd/modern/objects/defaults',
  './plugins/core/commands',
  './plugins/core/events',
  './plugins/core/formatters/html/replace-nbsp-chars',
  './plugins/core/formatters/html/enforce-p-elements',
  './plugins/core/formatters/html/ensure-selectable-containers',
  './plugins/core/formatters/plain-text/escape-html-characters',
  './plugins/core/inline-elements-mode',
  './plugins/core/patches',
  './plugins/core/set-root-p-element',
  './api',
  './transaction-manager',
  './undo-manager',
  './event-emitter',
  './element',
  './node',
  'immutable/dist/immutable'
], function (
  defaults,
  commands,
  events,
  replaceNbspCharsFormatter,
  enforcePElements,
  ensureSelectableContainers,
  escapeHtmlCharactersFormatter,
  inlineElementsMode,
  patches,
  setRootPElement,
  Api,
  buildTransactionManager,
  UndoManager,
  EventEmitter,
  elementHelpers,
  nodeHelpers,
  Immutable
) {

  'use strict';

  function Scribe(el, options) {
    EventEmitter.call(this);

    this.el = el;
    this.commands = {};

    this.options = defaults(options || {}, {
      allowBlockElements: true,
      debug: false,
      undo: { manager: null, enabled: true, limit: 100, interval: 1000 },
      defaultCommandPatches: [
        'bold',
        'indent',
        'insertHTML',
        'insertList',
        'outdent',
        'createLink'
      ]
    });

    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();

    this.api = new Api(this);

    this.node = nodeHelpers;
    this.element = elementHelpers;

    this.Immutable = Immutable;

    var TransactionManager = buildTransactionManager(this);
    this.transactionManager = new TransactionManager();

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
    }

    this.setHTML(this.getHTML());

    this.el.setAttribute('contenteditable', true);

    this.el.addEventListener('input', function () {
      /**
       * This event triggers when either the user types something or a native
       * command is executed which causes the content to change (i.e.
       * `document.execCommand('bold')`). We can't wrap a transaction around
       * these actions, so instead we run the transaction in this event.
       */
      this.transactionManager.run();
    }.bind(this), false);

    /**
     * Core Plugins
     */

    if (this.allowsBlockElements()) {
      // Commands assume block elements are allowed, so all we have to do is
      // set the content.
      // TODO: replace this by initial formatter application?
      this.use(setRootPElement());
      // Warning: enforcePElements must come before ensureSelectableContainers
      this.use(enforcePElements());
      this.use(ensureSelectableContainers());
    } else {
      // Commands assume block elements are allowed, so we have to set the
      // content and override some UX.
      this.use(inlineElementsMode());
    }

    // Formatters
    var defaultFormatters = Immutable.List.of(
      escapeHtmlCharactersFormatter,
      replaceNbspCharsFormatter
    );


    // Patches

    var defaultPatches = Immutable.List.of(
      patches.events
    );

    var defaultCommandPatches = Immutable.List(this.options.defaultCommandPatches).map(function(patch) { return patches.commands[patch]; });

    var defaultCommands = Immutable.List.of(
      'indent',
      'insertList',
      'outdent',
      'redo',
      'subscript',
      'superscript',
      'undo'
    ).map(function(command) { return commands[command]; });

    var allPlugins = Immutable.List().concat(
      defaultFormatters,
      defaultPatches,
      defaultCommandPatches,
      defaultCommands);

    allPlugins.forEach(function(plugin) {
      this.use(plugin());
    }.bind(this));

    this.use(events());
  }

  Scribe.prototype = Object.create(EventEmitter.prototype);

  // For plugins
  // TODO: tap combinator?
  Scribe.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
  };

  Scribe.prototype.setHTML = function (html, skipFormatters) {
    if (skipFormatters) {
      this._skipFormatters = true;
    }
    // IE11: Setting HTML to the value it already has causes breakages elsewhere (see #336)
    if (this.el.innerHTML !== html) {
      this.el.innerHTML = html;
    }

    this._previousContent = this.getHTML();
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
    var scribe = this;

    if (scribe.options.undo.enabled) {
      // Get scribe previous content, and strip markers.
      var previousContent = scribe._previousContent;
      var previousContentNoMarkers = previousContent && previousContent
        .replace(/<em class="scribe-marker">/g, '').replace(/<\/em>/g, '');

      // We only want to push the history if the content actually changed.
      if (scribe.getHTML() !== previousContentNoMarkers) {
        var selection = new scribe.api.Selection();

        selection.placeMarkers();
        var content = scribe.getHTML();
        selection.removeMarkers();

        // Checking if there is a need to merge, there is an item to merge with,
        // and the last item is a scribe transaction of the same source.
        // It is possible the last transaction is not for the same instance, or
        // even not a scribe transaction (e.g. when using a shared undo manager).

        var lastItem = scribe.undoManager.item(scribe.undoManager.position);
        if ((scribe._merge || scribe._forceMerge) && lastItem && scribe == lastItem[0].scribe) {
          // Merge manually with the last item to save more memory space.
          lastItem[0].content = content;
        }
        else {
          // Otherwise, register a new transaction.
          scribe.undoManager.transact({
            previousContent: previousContent,
            content: content,
            scribe: scribe,
            execute: function () { },
            undo: function () { this.scribe.restoreFromHistory(this.previousContent); },
            redo: function () { this.scribe.restoreFromHistory(this.content); }
          }, false);
        }

        // Merge next transaction if it happens before the interval option, otherwise don't merge.
        clearTimeout(scribe._mergeTimer);
        scribe._merge = true;
        scribe._mergeTimer = setTimeout(function() { scribe._merge = false; }, scribe.options.undo.interval);

        return true;
      }
    }

    return false;
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem, true);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers();

    // Because we skip the formatters, a transaction is not run, so we have to
    // emit this event ourselves.
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
    this._htmlFormatterFactory.formatters[phase]
      = this._htmlFormatterFactory.formatters[phase].push(formatter);
  };

  Scribe.prototype.registerPlainTextFormatter = function (formatter) {
    this._plainTextFormatterFactory.formatters
      = this._plainTextFormatterFactory.formatters.push(formatter);
  };

  // TODO: abstract
  function FormatterFactory() {
    this.formatters = Immutable.List();
  }

  FormatterFactory.prototype.format = function (html) {
    // Map the object to an array: Array[Formatter]
    var formatted = this.formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  function HTMLFormatterFactory() {
    // Define phases
    // For a list of formatters, see https://github.com/guardian/scribe/issues/126
    this.formatters = {
      // Configurable sanitization of the HTML, e.g. converting/filter/removing
      // elements
      sanitize: Immutable.List(),
      // Normalize content to ensure it is ready for interaction
      normalize: Immutable.List(),
      'export': Immutable.List()
    };
  }

  HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
  HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;

  HTMLFormatterFactory.prototype.format = function (html) {
    var formatters = this.formatters.sanitize.concat(this.formatters.normalize);

    var formatted = formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  HTMLFormatterFactory.prototype.formatForExport = function (html) {
    return this.formatters['export'].reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  return Scribe;

});
