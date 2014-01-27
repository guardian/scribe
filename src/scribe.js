define([
  'event-emitter',
  'lodash-modern/objects/defaults',
  './initializers/root-paragraph-element',
  './initializers/insert-br-on-return',
  './plugins/core/commands',
  './plugins/core/formatters',
  './plugins/core/formatters/replace-nbsp-chars',
  './plugins/core/patches',
  './plugins/core/shame',
  './api',
  './transaction-manager',
  './undo-manager'
], function (
  EventEmitter,
  defaults,
  rootParagraphElement,
  insertBrOnReturn,
  commands,
  formatters,
  replaceNbspCharsFormatter,
  patches,
  shame,
  Api,
  buildTransactionManager,
  UndoManager
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

    var TransactionManager = buildTransactionManager(this);
    this.undoManager = new UndoManager();
    this.transactionManager = new TransactionManager();

    this.el.addEventListener('input', function () {
      /**
       * This event triggers when either the user types something or a native
       * command is executed which causes the content to change (i.e.
       * `document.execCommand('bold')`). We can't wrap a transaction around
       * these actions, so instead we run the transaction in this event.
       */
       /**
        * Chrome (<=23): The input event is triggered after the input happens
        * but before the caret position is changed.
        * Need to reproduce: http://jsbin.com/iWetuGEs/1/edit
        * TODO: could this cause other issues?
        */
      setTimeout(function () {
        this.transactionManager.run();
      }.bind(this), 0);
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

    // Formatters
    // TODO: should the formatter object itself be an API instead of a plugin?
    this.use(formatters());
    this.use(replaceNbspCharsFormatter());

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

    // TODO: abstract
    this.el.addEventListener('focus', function () {
      /**
       * Firefox: Giving focus to a `contenteditable` will place the caret
       * outside of any block elements. Chrome behaves correctly by placing the
       * caret at the  earliest point possible inside the first block element.
       * As per: http://jsbin.com/eLoFOku/1/edit?js,console,output
       *
       * We detect when this occurs and fix it by placing the caret ourselves.
       */
      var selection = new this.api.Selection();
      // FIXME: Chrome error
      selection.placeMarkers();
      var firefoxBug = this.getHTML().match(/^<em class="scribe-marker"><\/em>/);
      selection.removeMarkers();

      if (this.allowsBlockElements() && firefoxBug) {
        var focusElement = getFirstDeepestChild(this.el.firstChild);

        var range = selection.range;

        range.setStart(focusElement, 0);
        range.setEnd(focusElement, 0);

        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      function getFirstDeepestChild(node) {
        var treeWalker = document.createTreeWalker(node);
        var previousNode = treeWalker.currentNode;
        if (treeWalker.firstChild()) {
          // TODO: build list of non-empty elements (used elsewhere)
          // Do not include non-empty elements
          if (treeWalker.currentNode.nodeName === 'BR') {
            return previousNode;
          } else {
            return getFirstDeepestChild(treeWalker.currentNode);
          }
        } else {
          return treeWalker.currentNode;
        }
      }
    }.bind(this));
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
    var previousUndoItem = this.undoManager.stack[this.undoManager.position];
    var previousContent = previousUndoItem && previousUndoItem
      .replace(/<em class="scribe-marker">/g, '').replace(/<\/em>/g, '');

    /**
     * Chrome and Firefox: If we did push to the history, this would break
     * browser magic around `Document.queryCommandState` (http://jsbin.com/eDOxacI/1/edit?js,console,output).
     * This happens when doing any DOM manipulation.
     */

    // We only want to push the history if the content actually changed.
    if (! previousUndoItem || (previousUndoItem && this.getContent() !== previousContent)) {
      var selection = new this.api.Selection();

      selection.placeMarkers();
      var html = this.el.innerHTML;
      selection.removeMarkers(this.el);

      this.undoManager.push(html);

      return true;
    } else {
      return false;
    }
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers();

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
