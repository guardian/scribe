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
  emptyEditorWhenDeleting
) {

  'use strict';

  return {
    commands: {
      bold: boldCommand,
      indent: indentCommand,
      insertList: insertListCommands,
      outdent: outdentCommand
    },
    emptyEditorWhenDeleting: emptyEditorWhenDeleting
  };

});
