
/**
 * Module dependencies.
 */

var events = require('events');
var janitor = require('janitor');

/**
 * Expose Sanitize wrapper for plugin support
 */

module.exports = function sanitize() {
  return function (editable) {
    return new Sanitize(editable);
  };
};


/**
 * Initializes Sanitize with `editable`.
 *
 * @param {Editable} editable
 * @return {self}
 * @api private
 */

function Sanitize(editable) {
  var el = this.el = editable.el;
  editable.sanitize = this;

  this.events = events(el, this);
  this.events.bind('paste', 'clean');
  this.events.bind('drop', 'clean');

  this.editable = editable;
  editable.on('html', this.clean.bind(this));
  editable.once('unbind', this.events.unbind.bind(this.events));
}


/**
 * Removes any html by setting the text
 * content with the text content. Bit lame.
 *
 * @api private
 */

var janitorConfig = {
  tags: {
    b: [],
    strong: [],
    i: [],
    s: [],
    blockquote: [],
    ol: [],
    ul: [],
    li: [],
    a: [ 'href' ],
    h2: []
  },
  protocols: [ 'http', 'https' ]
};

Sanitize.prototype.clean = function () {
  var edit = this.editable;

  setTimeout(function () {
    edit.html(janitor.clean(edit.html(), janitorConfig));
  }, 0);

  // // Text only
  // setTimeout(function () {
  //   edit.text(edit.text());
  // }, 0);
};
