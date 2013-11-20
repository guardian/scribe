define(function () {

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
       */
       // Do not use `setHTML` method because we don't want to add to the
       // undo stack in this case.
      editor.el.innerHTML = '<p><br></p>';
    };
  };

});
