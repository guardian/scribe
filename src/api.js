define([
  './api/command-patch',
  './api/command',
  './api/element',
  './api/node',
  './api/selection',
  './api/simple-command'
], function (
  buildCommandPatch,
  buildCommand,
  element,
  Node,
  buildSelection,
  buildSimpleCommand
) {

  'use strict';

  return function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.element = element;
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };
});
