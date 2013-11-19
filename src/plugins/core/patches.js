define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/indent-command',
  './patches/insert-list-commands',
  './patches/outdent-command',
  './patches/root-paragraph-element',
  './patches/undo-command'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  indentCommand,
  insertListCommands,
  outdentCommand,
  rootParagraphElement,
  undoCommand
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    indentCommand: indentCommand,
    insertListCommands: insertListCommands,
    outdentCommand: outdentCommand,
    rootParagraphElement: rootParagraphElement,
    undoCommand: undoCommand
  };

});
