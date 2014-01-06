define(function () {

  'use strict';

  return function (toolbarNode) {
    return function (scribe) {
      scribe.addInitializer(function () {
        var buttons = toolbarNode.querySelectorAll('button');

        Array.prototype.forEach.call(buttons, function (button) {
          // Look for a predefined command, otherwise define one now.
          var command = scribe.getCommand(button.dataset.commandName);

          button.addEventListener('click', function () {
            command.execute();
            // Chrome focuses the scribe automatically. Firefox does not.
            scribe.el.focus();
          });

          // Keep the state of toolbar buttons in sync with the current selection.
          // Unfortunately, there is no `selectionchange` event.
          scribe.el.addEventListener('keyup', updateUi);
          scribe.el.addEventListener('mouseup', updateUi);
          // We also want to update the UI whenever the content changes. This
          // could be when one of the toolbar buttons is actioned.
          // TODO: The `input` event does not trigger when we manipulate the content
          // ourselves. Maybe commands should fire events when they are activated.
          scribe.on('content-changed', updateUi);

          function updateUi() {
            var selection = new scribe.api.Selection();

            if (selection.range) {
              if (command.queryEnabled()) {
                button.removeAttribute('disabled');

                if (command.queryState()) {
                  button.classList.add('active');
                } else {
                  button.classList.remove('active');
                }
              } else {
                button.setAttribute('disabled', 'disabled');
              }
            }
          }
        });
      });
    };
  };

});
