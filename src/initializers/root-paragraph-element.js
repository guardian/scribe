define([
  '../api/selection'
], function (
  Selection
) {

  /**
   * Sets the default content of the scribe so that each carriage return creates
   * a P.
   */

  'use strict';

  return function () {
    return function (scribe) {
      // The content might have already been set, in which case we don't want
      // to apply.
      if (scribe.el.innerHTML === '') {
        /**
         * We have to begin with the following HTML, because otherwise some
         * browsers(?) will position the caret outside of the P when the scribe is
         * focused.
         *
         * We also have to define a marker because otherwise the selection will
         * not be restored when we undo.
         */
        scribe.setHTML('<p><em class="scribe-marker"></em><br></p>');

        var selection = new Selection();
        selection.removeMarkers(scribe.el);
      }
    };
  };

});
