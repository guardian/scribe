define([ 'html-janitor' ], function (HTMLJanitor) {
  /**
   * Initializes Sanitize with `editable`.
   *
   * @param {Editable} editable
   * @return {self}
   * @api private
   */

  function Sanitize(editable, config) {
    var el = this.el = editable.el;
    this.editable = editable;
    editable.sanitize = this;

    this.janitor = new HTMLJanitor(config);

    // We need to sanitize when the user pastes data in.
    this.el.addEventListener('paste', function (event) {
      // TODO: is this needed?
      event.preventDefault();
      // TODO: what data should we be getting?
      var data = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain');
      console.log('Event: paste', data);

      sanitizedData = this.clean(data);

      // Mercury.Regions.Full#execCommand
      document.execCommand('insertHTML', false, sanitizedData);
    }.bind(this));
  }


  // Undo/redo management issues: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
  Sanitize.prototype.clean = function (data) {
    var editable = this.editable;

    // Substitute `this`…!
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    return this.janitor.clean(data);
  };

  /**
   * Expose Sanitize wrapper for plugin support
   */

  return function (config) {
    return function (editable) {
      return new Sanitize(editable, config);
    };
  };
});
