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
      var janitor = new HTMLJanitor(config);

      scribe.htmlFormatter.formatters.push(janitor.clean.bind(janitor));
    };
  };

});
