define([
  './patches/empty-editor-when-deleting',
  './patches/root-paragraph-element'
], function (
  emptyEditorWhenDeleting,
  rootParagraphElement
) {

  'use strict';

  return {
    emptyEditorWhenDeleting: emptyEditorWhenDeleting,
    rootParagraphElement: rootParagraphElement
  };

});
