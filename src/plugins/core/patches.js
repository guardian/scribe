define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/indent-command',
  './patches/insert-list-commands',
  './patches/outdent-command',
  './patches/root-paragraph-element',
  './patches/undo-manager-commands'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  indentCommand,
  insertListCommands,
  outdentCommand,
  rootParagraphElement,
  undoManagerCommands
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    indentCommand: indentCommand,
    insertListCommands: insertListCommands,
    outdentCommand: outdentCommand,
    rootParagraphElement: rootParagraphElement,
    undoManagerCommands: undoManagerCommands
  };

});
