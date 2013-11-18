define([
  '../api',
  '../api/command'
], function (
  api
) {

  'use strict';

  return function (toolbars) {
    return function (editable) {
      Array.prototype.forEach.call(toolbars, function (toolbar) {
        var buttons = toolbar.querySelectorAll('button');

        Array.prototype.forEach.call(buttons, function (button) {
          // Look for a predefined command, otherwise define one now.
          var command = editable.commands[button.dataset.commandName] || new api.Command(editable, button.dataset.commandName);

          button.addEventListener('click', function () {
            command.execute();
            // Chrome focuses the editor automatically. Firefox does not.
            editable.el.focus();
          });

          // Keep the state of toolbar buttons in sync with the current selection.
          // Unfortunately, there is no `selectionchange` event.
          editable.el.addEventListener('keyup', updateUi);
          editable.el.addEventListener('mouseup', updateUi);
          // We also want to update the UI whenever the content changes. This
          // could be when one of the toolbar buttons is actioned.
          // TODO: The `input` event does not trigger when we manipulate the content
          // ourselves. Maybe commands should fire events when they are activated.
          editable.el.addEventListener('input', updateUi);

          function updateUi() {
            if (command.queryState()) {
              button.classList.add('active');
            } else {
              button.classList.remove('active');
            }
          }
        });
      });
    };
  };

});
