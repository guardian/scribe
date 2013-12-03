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

    // FIXME: event order matters
    // TODO: figure out a better way to organise all of this stuff
    if (this.options.paragraphs) {
      // P mode
      this.addInitializer(rootParagraphElement());
    } else {
      // BR mode
      /**
       * Firefox has a `insertBrOnReturn` command, but this is not a part of
       * any standard. One day we might have an `insertLineBreak` command,
       * proposed by this spec:
       * https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-insertlinebreak-command
       * As per: http://jsbin.com/IQUraXA/1/edit?html,js,output
       */
      this.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { // enter
          var selection = new Selection();
          var range = selection.range;

          var blockNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI' || (/^(H[1-6])$/).test(node.nodeName);
          });

          if (! blockNode) {
            event.preventDefault();
            // The first <br> is the line break, the second <br> is simply
            // where the caret will go (and replace).
            var brNode = document.createElement('br');
            var caretBrNode = document.createElement('br');

            range.insertNode(brNode);
            // After inserting the BR into the range is no longer collapsed, so
            // we have to collapse it again.
            range.collapse();
            range.insertNode(caretBrNode);

            var newRange = new window.Range();

            newRange.setStartAfter(caretBrNode, 0);
            newRange.setEndAfter(caretBrNode, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(newRange);

            this.pushHistory();
            this.trigger('content-changed');
          }
        }
      }.bind(this));

      if (this.getHTML() === '') {
        this.pushHistory();
        this.trigger('content-changed');
      }
    }

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
