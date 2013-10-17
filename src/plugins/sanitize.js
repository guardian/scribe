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
      /**
       * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
       * will execute the second branch here.
       */
      var data;
      if (event.clipboardData) {
        event.preventDefault();
        // TODO: what data should we be getting?
        data = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');

        this.insert(data);
      } else {
        /**
         * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
         * sequence of events which involves pasting the data in another element,
         * manipulates it, and then inserts it into the editor instance. This however
         * requires that we save and restore the caret position.
         *
         * This is required because, without access to the Clipboard API, there is literally
         * no other way to manipulate content on paste.
         * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
         */
        // TODO: use internal API for getting range
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var startMarker;
        var endMarker;

        /**
         * Mercury.Regions.Full.Selection#placeMarker
         */
        (function () {
          // TODO: why?
          if (!range) {
            return;
          }

          startMarker = document.createElement('em');
          startMarker.classList.add('editor-marker');
          endMarker = document.createElement('em');
          endMarker.classList.add('editor-marker');

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

        var bin = document.createElement('div');
        document.body.appendChild(bin);
        bin.setAttribute('contenteditable', true);
        bin.focus();

        setTimeout(function () {
          data = bin.innerHTML;
          bin.parentNode.removeChild(bin);

          /**
           * Mercury.Regions.Full.Selection#selectMarker
           */
          (function () {
            var markers = editable.el.querySelectorAll('em.editor-marker');
            if (!markers.length) {
              return;
            }

            var range = window.document.createRange();
            range.setStartBefore(markers[0]);
            if (markers.length >= 2) {
              range.setEndBefore(markers[1]);
            }

            Array.prototype.forEach.call(markers, function (marker) {
              marker.parentNode.removeChild(marker);
            });

            selection.removeAllRanges();
            selection.addRange(range);
          })();

          this.el.focus();
          this.insert(data);
        }.bind(this), 1);
      }
    }.bind(this));
  }

  Sanitize.prototype.clean = function (data) {
    var editable = this.editable;

    // TODO: use internal API for getting range
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    return this.janitor.clean(data);
  };

  Sanitize.prototype.insert = function (data) {
    sanitizedData = this.clean(data);

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
