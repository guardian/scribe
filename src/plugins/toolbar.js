define([ '../api/command' ], function (Command) {
  return function (toolbar) {
    return function (editable) {
      var buttons = toolbar.querySelectorAll('button');

      Array.prototype.forEach.call(buttons, function (button) {
        /**
         * We allow buttons to be predefine their corresponding commands.
         * We use the predefined command if there is one, otherwise we define
         * one now (in which case it must be native).
         */
        var command = button.editor && button.editor.command || new Command(button.dataset.commandName);

        button.addEventListener('click', function () {
          command.execute();
          updateUi();
        });

        // Keep the state of toolbar buttons in sync with the current selection.
        // Unfortunately, there is no `selectionchange` event.
        editable.el.addEventListener('keyup', updateUi);
        editable.el.addEventListener('mouseup', updateUi);

        function updateUi() {
          if (command.queryState()) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        }
      });

    };
  };
});
