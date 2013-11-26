define([
  './command',
  './selection'
], function (
  Command,
  Selection
) {

  'use strict';

  function SimpleCommand(editor, commandName, nodeName) {
    Command.call(this, editor, commandName);

    this.nodeName = nodeName;
  }

  SimpleCommand.prototype = Object.create(Command.prototype);
  SimpleCommand.prototype.constructor = SimpleCommand;

  SimpleCommand.prototype.queryState = function () {
    var selection = new Selection();
    return !! selection.getContaining(function (node) {
      return node.nodeName === this.nodeName;
    }.bind(this));
  };

  return SimpleCommand;

});
