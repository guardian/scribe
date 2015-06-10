define(function () {

  'use strict';

  return function (scribe, Command) {
    function SimpleCommand(commandName, nodeName) {
      Command.call(this, commandName);
      this._nodeName = nodeName;
    }

    SimpleCommand.prototype = Object.create(Command.prototype);
    SimpleCommand.prototype.constructor = SimpleCommand;

    SimpleCommand.prototype.queryState = function () {
      var selection = new scribe.api.Selection();
      return this.queryState() && !! selection.getContaining(function (nodeName, node) {
        return node.nodeName === nodeName;
      }.bind(undefined, this._nodeName));
    };

    return SimpleCommand;
  };

});
