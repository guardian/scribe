define([
  '../api/selection'
], function (
  Selection
) {

  /**
   * Sets the default content of the editor so that each carriage return creates
   * a P.
   */

  'use strict';

  return function () {
    return function (editor) {
      /**
       * We have to begin with the following HTML, because otherwise some
       * browsers(?) will position the caret outside of the P when the editor is
       * focused.
       *
       * We also have to define a marker because otherwise the selection will
       * not be restored when we undo.
       */
      editor.setHTML('<p><em class="editor-marker"></em><br></p>');

      editor.pushHistory();
      editor.trigger('content-changed');

      var selection = new Selection();
      selection.removeMarkers(editor.el);
    };
  };

});
