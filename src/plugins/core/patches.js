define([
  './patches/bold-command',
  './patches/empty-editor-when-deleting',
  './patches/root-paragraph-element'
], function (
  boldCommand,
  emptyEditorWhenDeleting,
  rootParagraphElement
) {

  'use strict';

  return {
    boldCommand: boldCommand,
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    rootParagraphElement: rootParagraphElement
  };

});
