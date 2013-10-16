
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var classes = require('classes');
var events = require('events');

/**
 * expose Editable
 */

module.exports = Editable;


/**
 * Initialize a given `el` as a
 * contenteditable element
 *
 * @param {Element} el
 * @return {self}
 * @api public
 */

function Editable(el) {
  if (!(this instanceof Editable)) return new Editable(el);
  this.el = el;
  this.events = events(el, this);
  this.classes = classes(el);
  this.context = document;

  this.el.setAttribute('contenteditable', true);
  this.html('<p><br></p>');

  // Firefox
  // document.execCommand('insertBrOnReturn', false, false);
}


/**
 * Mixin Emitter
 */

Emitter(Editable.prototype);

/**
 * Convenience method to hook in plugins.
 *
 * @param {Function} fn
 * @api private
 */

Editable.prototype.use = function (fn) {
  fn(this);
  return this;
};


/**
 * Removes event listeners, not before emitting
 * `'unbind'` to which plugins can bind to it,
 * and programatically unbind there callbacks.
 *
 * @return {self}
 * @api public
 */

Editable.prototype.unbind = function () {
  this.emit('unbind');
  this.off();
  return this;
};


/**
 * `.innerHTML` getter/setter
 *
 * @param {String} html
 * @return {String}
 * @api public
 */

Editable.prototype.html = function (html) {
  if (typeof(html) !== 'undefined') {
    this.el.innerHTML = html;
    this.emit('html', html);
  }

  return this.el.innerHTML;
};


/**
 * `.textContent` getter/setter. Falls back
 * to `innerText`.
 *
 * @param {String} text
 * @return {String}
 * @api public
 */

Editable.prototype.text = function (text) {
  var el = this.el;
  var defined = (typeof(text) !== 'undefined');
  var fn = 'textContent' in el ? 'textContent' : 'innerText';

  if (defined) {
    el[fn] = text.trim();
    this.emit('text', text.trim());
  }

  return el[fn].trim();
};
