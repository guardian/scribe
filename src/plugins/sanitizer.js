define([
  'html-janitor'
], function (
  HTMLJanitor
) {

  /**
   * This plugin adds the ability to sanitize content when it is pasted into the
   * editor, adhering to a whitelist of allowed tags and attributes.
   */

  'use strict';

  return function (config) {
    return function (editor) {
      return sanitizer(editor, config);
    };
  };

  /**
   * Initializes sanitizer plugin on Editor instance.
   *
   * @param {Editor} editor
   * @param {Object} config For configuring the janitor
   * @return {self}
   */
  function sanitizer(editor, config) {
    var janitor = new HTMLJanitor(config);

    editor.formatters.push(janitor.clean.bind(janitor));
  }

});
