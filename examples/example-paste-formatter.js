/**
 * This is a simple paste formatter example which
 * removes style attributes from all elements that have
 * them.
 */
define(function () {

  'use strict';

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('paste', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        var styledEls = bin.querySelectorAll('[style]');
        Array.prototype.forEach.call(styledEls, function (el) {
          el.removeAttribute('style');
        });
        return bin.innerHTML;
      });
    };
  };

});
