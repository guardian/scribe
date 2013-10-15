
/**
 * Module dependencies.
 */

var events = require('events');
var janitor = require('janitor');

/**
 * Expose Sanitize wrapper for plugin support
 */

module.exports = function (editable) {
  return new Sanitize(editable);
};


/**
 * Initializes Sanitize with `editable`.
 *
 * @param {Editable} editable
 * @return {self}
 * @api private
 */

function Sanitize(editable) {
  var el = this.el = editable.el;
  this.editable = editable;
  editable.sanitize = this;

  this.events = events(el, this);
  this.events.bind('paste', 'clean');
  this.events.bind('drop', 'clean');

  editable.once('unbind', this.events.unbind.bind(this.events));
}


/**
 * Removes any html by setting the text
 * content with the text content. Bit lame.
 *
 * @api private
 */

var janitorConfig = {
  tags: {
    p: [],
    b: [],
    strong: [],
    i: [],
    s: [],
    blockquote: [],
    ol: [],
    ul: [],
    li: [],
    a: [ 'href' ],
    h2: []
  }
};

Sanitize.prototype.clean = function (event) {
  // TODO: is this needed?
  event.preventDefault();
  var editable = this.editable;

  // Substitute `this`…!
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  var startMarker, endMarker;

  (function () {
    /**
     * Mercury.Regions.Full.Selection#placeMarker
     */

    // TODO: why?
    if (!range) {
      return;
    }

    startMarker = document.createElement('em');
    startMarker.classList.add('mercury-marker');
    endMarker = document.createElement('em');
    endMarker.classList.add('mercury-marker');

    // put a single marker (the end)
    var rangeEnd = range.cloneRange();
    rangeEnd.collapse(false);
    rangeEnd.insertNode(endMarker);

    if (!range.collapsed) {
      // put a start marker
      var rangeStart = range.cloneRange();
      rangeStart.collapse(false);
      rangeStart.insertNode(startMarker);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  })();

  // To be continued…

  var pastedData = event.clipboardData.getData('text/html');

  // Undo/redo management issues: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347

  var sanitizedData = janitor.clean(pastedData, janitorConfig);

  (function () {
    /**
     * Mercury.Regions.Full.Selection#selectMarker
     */
    var markers = editable.el.querySelectorAll('em.mercury-marker');
    if (!markers.length) {
      return;
    }

    var range = window.document.createRange();
    range.setStartBefore(markers[0]);
    if (markers.length >= 2) {
      range.setEndBefore(markers[1]);
    }

    Array.prototype.forEach.call(markers, function (marker) {
      marker.remove();
    });

    selection.removeAllRanges();
    selection.addRange(range);
  })();

  (function () {
    /**
     * Mercury.Regions.Full.Selection#removeMarker
     */

     startMarker.remove();
     endMarker.remove();
  })();

  // Mercury.Regions.Full#execCommand
  document.execCommand('insertHTML', false, sanitizedData);
};
