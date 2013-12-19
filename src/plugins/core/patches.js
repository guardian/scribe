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

  /**
   * Command patches browser inconsistencies. They do not perform core features
   * of the editor, such as ensuring P elements are created when
   * applying/unapplying commands — that is the job of the core commands.
   */

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
