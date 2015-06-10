define(function () {

  'use strict';

  return function (scribe) {
    var rootDoc = scribe.el.ownerDocument;
    var nodeHelper = scribe.node;

    // find the parent document or document fragment
    if( rootDoc.compareDocumentPosition(scribe.el) & Node.DOCUMENT_POSITION_DISCONNECTED ) {
      var currentElement = nodeHelper.getAncestor(scribe.el, nodeHelper.isFragment);
      // if we found a document fragment and it has a getSelection method, set it to the root doc
      if (currentElement && currentElement.getSelection) {
        rootDoc = currentElement;
      }
    }

    function createMarker() {
      var node = document.createElement('em');
      node.classList.add('scribe-marker');
      return node;
    }

    function insertMarker(range, marker) {
      range.insertNode(marker);

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
       * the inserted element. We just remove it. This in turn creates several
       * bugs when perfoming commands on selections that contain an empty text
       * node (`removeFormat`, `unlink`).
       * As per: http://jsbin.com/hajim/5/edit?js,console,output
       */
      // TODO: abstract into polyfill for `Range.insertNode`
      if (marker.nextSibling && nodeHelper.isEmptyTextNode(marker.nextSibling)) {
        nodeHelper.removeNode(marker.nextSibling);
      }

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
       * the inserted element when the child element is at the start of a block
       * element. We just remove it.
       * FIXME: Document why we need to remove this
       * As per: http://jsbin.com/sifez/1/edit?js,console,output
       */
      if (marker.previousSibling && nodeHelper.isEmptyTextNode(marker.previousSibling)) {
        nodeHelper.removeNode(marker.previousSibling);
      }
    }

    /**
     * Wrapper for object holding currently selected text.
     */
    function Selection() {
      this.selection = rootDoc.getSelection();
      if (this.selection.rangeCount && this.selection.anchorNode) {
        // create the range to avoid chrome bug from getRangeAt / window.getSelection()
        // https://code.google.com/p/chromium/issues/detail?id=380690
        this.range = document.createRange();

        if( nodeHelper.isBefore(this.selection.anchorNode, this.selection.focusNode) ) {
          this.range.setStart(this.selection.anchorNode, this.selection.anchorOffset);
          this.range.setEnd(this.selection.focusNode, this.selection.focusOffset);
        } else {
          this.range.setStart(this.selection.focusNode, this.selection.focusOffset);
          this.range.setEnd(this.selection.anchorNode, this.selection.anchorOffset);
        }
      }
    }

    /**
     * @returns Closest ancestor Node satisfying nodeFilter. Undefined if none
     * exist before reaching Scribe container.
     */
    Selection.prototype.getContaining = function (nodeFilter) {
      if (!this.range) { return; }

      var ancestor = this.range.commonAncestorContainer;
      if (scribe.el === ancestor || !nodeFilter(ancestor)) {
        ancestor = nodeHelper.getAncestor(ancestor, nodeFilter);
      }

      return ancestor;
    }

    Selection.prototype.placeMarkers = function () {
      var range = this.range;
      if (!range) { return; }

      //we need to ensure that the scribe's element lives within the current document
      //to avoid errors with the range comparison (see below)
      if (!document.contains(scribe.el)) {
        return;
      }

      //we want to ensure that the current selection is within the current scribe node
      //if this isn't true scribe will place markers within the selections parent
      //we want to ensure that scribe ONLY places markers within it's own element
      if (scribe.el.contains(range.startContainer) && scribe.el.contains(range.endContainer)) {
        // insert start marker
        insertMarker(range, createMarker());

        if (! range.collapsed ) {
          // End marker
          var rangeEnd = range.cloneRange();
          rangeEnd.collapse(false);
          insertMarker(rangeEnd, createMarker());
        }

        this.selection.removeAllRanges();
        this.selection.addRange(range);
      }
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      Array.prototype.forEach.call(this.getMarkers(), function (marker) {
        nodeHelper.removeNode(marker);
      });
    };

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    Selection.prototype.selectMarkers = function (keepMarkers) {
      var markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      var newRange = document.createRange();

      newRange.setStartBefore(markers[0]);
      // We always reset the end marker because otherwise it will just
      // use the current range’s end marker.
      newRange.setEndAfter(markers[1] || markers[0]);

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      return !! containerPElement && nodeHelper.isEmptyInlineElement(containerPElement);
    };

    return Selection;
  };

});
