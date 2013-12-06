define([
  './patches/commands/bold',
  './patches/commands/indent',
  './patches/commands/insert-list',
  './patches/commands/outdent',
  './patches/empty-when-deleting'
], function (
  boldCommand,
  indentCommand,
  insertListCommands,
  outdentCommand,
  emptyWhenDeleting
) {

  'use strict';

  return {
    commands: {
      bold: boldCommand,
      indent: indentCommand,
      insertList: insertListCommands,
      outdent: outdentCommand
    },
    emptyWhenDeleting: emptyWhenDeleting
  };

});
