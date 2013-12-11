define([
  '../api/selection',
  'lodash-modern/objects/findKey'
], function (
  Selection,
  findKey
) {

  'use strict';

  return function (commandsToKeyboardShortcutsMap) {
    return function (scribe) {
      scribe.addInitializer(function () {
        scribe.el.addEventListener('keydown', function (event) {
          var commandName = findKey(commandsToKeyboardShortcutsMap, function (isKeyboardShortcut) {
            return isKeyboardShortcut(event);
          });

          if (commandName) {
            // FIXME: should command return undefined if one is
            // not found.

            var command = scribe.getCommand(commandName);
            event.preventDefault();

            if (command.queryEnabled()) {
              command.execute();
            }
          }
        });
      });
    };
  };

});
