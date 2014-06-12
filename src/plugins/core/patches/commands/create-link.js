define(function () {

  'use strict';

  return function () {
    return function (scribe) {
      var createLinkCommand = new scribe.api.CommandPatch('createLink');
      scribe.commandPatches.createLink = createLinkCommand;

      createLinkCommand.execute = function (value) {
        var selection = new scribe.api.Selection();

        /**
         * Firefox does not create a link when selection is collapsed
         * so we create is manually. http://jsbin.com/tutufi/2/edit?js,output
         */
        if (selection.selection.isCollapsed) {
          var aElement = document.createElement('a');
          aElement.setAttribute('href', value);
          aElement.textContent = value;

          var range = selection.range.cloneRange();
          range.insertNode(aElement);

          // Place caret at the end of link
          var newRange = document.createRange();
          newRange.setStartAfter(aElement);
          newRange.setEndAfter(aElement);
          selection.selection.removeAllRanges();
          selection.selection.addRange(newRange);

          return null;
        };

        return scribe.api.CommandPatch.prototype.execute.call(this, value);
      };
    };
  };

});
