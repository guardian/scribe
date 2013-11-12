define([
  'html-janitor',
  '../api/get-event-clipboard-data'
], function (
  HTMLJanitor,
  getEventClipboardData
) {

  'use strict';

  return function (config) {
    return function (editable) {
      return sanitizer(editable, config);
    };
  };

  /**
   * Initializes sanitizer plugin on Editable instance.
   *
   * @param {Editable} editable
   * @param {Object} config For configuring the janitor
   * @return {self}
   */
  function sanitizer(editable, config) {
    var janitor = new HTMLJanitor(config);

    // We need to sanitize when the user pastes data in.
    editable.el.addEventListener('paste', function (event) {
      getEventClipboardData(editable, event).then(function (data) {
        editable.el.focus();
        sanitizeAndInsert(data);
      });
    });

    function sanitizeAndInsert(data) {
      var sanitizedData = janitor.clean(data);

      document.execCommand('insertHTML', false, sanitizedData);
    }
  }

});
