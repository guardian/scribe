define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/root-paragraph-element',
  './patches/undo-command'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  rootParagraphElement,
  undoCommand
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    rootParagraphElement: rootParagraphElement,
    undoCommand: undoCommand
  };

});
