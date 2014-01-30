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
  Element,
  Node,
  buildSelection,
  buildSimpleCommand
) {

  'use strict';

  return function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Element = Element;
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };
});
