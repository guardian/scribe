define([
  '../../../api/selection',
  '../../../api/simple-command'
], function (
  Selection,
  SimpleCommand
) {

  'use strict';

  return function () {
    return function (scribe) {
      var outdentCommand = new SimpleCommand(scribe, 'outdent');

      outdentCommand.queryEnabled = function () {
        /**
         * FIXME: If the paragraphs option is set to true, then when the
         * list is unapplied, ensure that we enter a P element.
         * Currently we just disable the command when the selection is inside of
         * a list.
         */
        var selection = new Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        // FIXME: define block element rule here?
        return SimpleCommand.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.outdent = outdentCommand;
    };
  };

});
