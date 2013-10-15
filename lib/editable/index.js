
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
  this.html('<p></p>');

  this.events.bind('focus', 'onFocus');
}


/**
 * Mixin Emitter
 */

Emitter(Editable.prototype);

Editable.prototype.onFocus = function () {
  /**
   * Life begins with content of `<p></p>`. When the element is focused, some(?) browsers
   * decide to place the caret outside of the p element (|<p></p>). This circumvents such
   * behaivour.
   */
  setTimeout(function () {
    // Substitute `this`…!
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);

    (function () {
      /**
       * Mercury.Regions.Full.Selection#forceSelection
       */

      var element = this.el;
      var newRange = this.context.createRange();

      var lastChild = element.lastChild;
      element.lastChild.textContent = '\x00';

      if (lastChild) {
        newRange.setStartBefore(lastChild);
        newRange.setEndBefore(lastChild);
        selection.addRange(newRange);
      }
    }.bind(this))();
  }.bind(this), 1);
};

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
