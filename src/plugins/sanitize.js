define([ 'html-janitor' ], function (HTMLJanitor) {
  /**
   * Initializes Sanitize with `editable`.
   *
   * @param {Editable} editable
   * @return {self}
   * @api private
   */

  function Sanitize(editable, config) {
    var el = this.el = editable.el;
    this.editable = editable;
    editable.sanitize = this;

    this.janitor = new HTMLJanitor(config);
    
    // We need to sanitize when the user pastes data in.
    this.el.addEventListener('paste', function (event) {
      // TODO: is this needed?
      event.preventDefault();
      // TODO: what data should we be getting?
      var data = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');
      console.log('Event: paste', data);
      this.clean(data);
    }.bind(this));
  }


  // Undo/redo management issues: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
  Sanitize.prototype.clean = function (data) {    
    var editable = this.editable;

    // Substitute `this`…!
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var startMarker, endMarker;
    
    var sanitizedData = this.janitor.clean(data);

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

  /**
   * Expose Sanitize wrapper for plugin support
   */

  return function (config) {
    return function (editable) {
      return new Sanitize(editable, config);
    };
  };
});
