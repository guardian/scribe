define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/indent-command',
  './patches/insert-list-commands',
  './patches/root-paragraph-element',
  './patches/undo-command'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  indentCommand,
  insertListCommands,
  rootParagraphElement,
  undoCommand
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    indentCommand: indentCommand,
    insertListCommands: insertListCommands,
    rootParagraphElement: rootParagraphElement,
    undoCommand: undoCommand
  };

});
