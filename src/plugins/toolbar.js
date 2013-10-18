define(function () {
  return function (toolbar) {
    return function (editable) {
      var button = toolbar.querySelector('button');

      button.addEventListener('click', function () {
        var command = 'bold';
        document.execCommand(command, false, null);
        var state = document.queryCommandState(command);

        if (state) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    };
  };
});
