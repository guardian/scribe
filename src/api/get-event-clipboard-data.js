define(['q'], function (Q) {

  'use strict';

  return getEventClipboardData;

  /**
   * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
   * I also don't like how it has the authority to perform `event.preventDefault`.
   */

  /**
   * Get the clipboard data for a given event. This is async because of the
   * nature of the polyfill (see comments below for detail).
   * @param  {Editable} editable The instance to polyfill.
   * @param  {Event} event
   * @return {Q.Promise}
   */
  function getEventClipboardData(editable, event) {
    var deferred = Q.defer();

    /**
     * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
     * will execute the second branch here.
     */
    var data;
    if (event.clipboardData) {
      event.preventDefault();
      // TODO: what data should we be getting?
      data = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');

      deferred.resolve(data);
    } else {
      /**
       * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
       * sequence of events:
       *
       *   - Save the text selection
       *   - Focus another, hidden textarea so we paste there
       *   - Copy the pasted content of said textarea
       *   - Give focus back to the editor
       *   - Restore the text selection
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

        deferred.resolve(data);
      }, 1);
    }

    return deferred.promise;
  }

});
