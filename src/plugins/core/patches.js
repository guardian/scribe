define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/indent-command',
  './patches/root-paragraph-element',
  './patches/undo-command'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  indentCommand,
  rootParagraphElement,
  undoCommand
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    indentCommand: indentCommand,
    rootParagraphElement: rootParagraphElement,
    undoCommand: undoCommand
  };

});
