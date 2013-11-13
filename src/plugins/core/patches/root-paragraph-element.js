define(function () {

  'use strict';

  return function () {
    return function (editable) {
      /**
       * We have to begin with the following HTML, because otherwise some browsers(?) will
       * position the caret outside of the `p` element when the editor is focused.
       */
      editable.html('<p><br></p>');
    };
  };

});
