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
      var indentCommand = new SimpleCommand(scribe, 'indent');

      indentCommand.queryEnabled = function () {
        /**
         * FIXME: Chrome nests ULs inside of ULs
         * Currently we just disable the command when the selection is inside of
         * a list.
         * As per: http://jsbin.com/ORikUPa/3/edit?html,js,output
         */
        var selection = new Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        return SimpleCommand.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.indent = indentCommand;
    };
  };

});
