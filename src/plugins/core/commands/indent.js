define([
  '../../../api/command',
  '../../../api/selection'
], function (
  Command,
  Selection
) {

  'use strict';

  return function () {
    return function (scribe) {
      var indentCommand = new Command(scribe, 'indent');

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

        return Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.indent = indentCommand;
    };
  };

});
