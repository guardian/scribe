define([
  'html-janitor'
], function (
  HTMLJanitor
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

    editable.formatters.push(janitor.clean.bind(janitor));
  }

});
