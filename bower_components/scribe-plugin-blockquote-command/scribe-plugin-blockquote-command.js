define('scribe-plugin-blockquote-command',[],function () {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  

  return function () {
    return function (scribe) {
      var blockquoteCommand = new scribe.api.SimpleCommand('blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        return command.queryEnabled();
      };

      blockquoteCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        var blockquoteElement = selection.getContaining(function (element) {
          return element.nodeName === 'BLOCKQUOTE';
        });

        return scribe.allowsBlockElements() && !! blockquoteElement;
      };

      scribe.commands.blockquote = blockquoteCommand;

      /**
       * If the paragraphs option is set to true, we unapply the blockquote on
       * <enter> keypresses if the caret is on a new line.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var command = scribe.getCommand('blockquote');
            if (command.queryState()) {
              var selection = new scribe.api.Selection();
              if (selection.isCaretOnNewLine()) {
                event.preventDefault();
                command.execute();
              }
            }
          }
        });
      }
    };
  };

});

//# sourceMappingURL=scribe-plugin-blockquote-command.js.map