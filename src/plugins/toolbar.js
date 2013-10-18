define(function () {
  function Command(commandName) {
    this.commandName = commandName;
  }

  Command.prototype.execute = function () {
    document.execCommand(this.commandName, false, null);
  };

  Command.prototype.queryState = function () {
    return document.queryCommandState(this.commandName);
  };

  return function (toolbar) {
    return function (editable) {
      var buttons = toolbar.querySelectorAll('button');

      Array.prototype.forEach.call(buttons, function (button) {
        var command = new Command(button.dataset.commandName);
        button.addEventListener('click', function () {
          command.execute();

          if (command.queryState()) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
      });

    };
  };
});
