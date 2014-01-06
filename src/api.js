define([
  'lodash-modern/objects/assign',
  './api/command-patch',
  './api/command',
  './api/node',
  './api/selection',
  './api/simple-command',
  './api/transaction-manager',
  './api/undo-manager'
], function (
  assign,
  buildCommandPatch,
  buildCommand,
  Node,
  buildSelection,
  buildSimpleCommand,
  buildTransactionManager,
  UndoManager
) {

  'use strict';

  return function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
    this.TransactionManager = buildTransactionManager(scribe);
    this.UndoManager = UndoManager;
  };
});
