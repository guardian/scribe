define([
  'html-janitor'
], function (
  HTMLJanitor
) {

  /**
   * This plugin adds the ability to sanitize content when it is pasted into the
   * scribe, adhering to a whitelist of allowed tags and attributes.
   */

  'use strict';

  return function (config) {
    return function (scribe) {
      return sanitizer(scribe, config);
    };
  };

  /**
   * Initializes sanitizer plugin on Scribe instance.
   *
   * @param {Scribe} scribe
   * @param {Object} config For configuring the janitor
   * @return {self}
   */
  function sanitizer(scribe, config) {
    var janitor = new HTMLJanitor(config);

    scribe.formatters.push(janitor.clean.bind(janitor));
  }

});
