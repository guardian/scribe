define(function () {
  function Editable(el) {
    if (!(this instanceof Editable)) return new Editable(el);
    this.el = el;
    this.context = document;
  
    this.el.setAttribute('contenteditable', true);
    this.html('<p><br></p>');
  }
  
  // For plugins
  Editable.prototype.use = function (fn) {
    fn(this);
    return this;
  };
  
  
  // Should this accept a node instead of HTML?
  Editable.prototype.html = function (html) {
    if (typeof(html) !== 'undefined') {
      this.el.innerHTML = html;
    }
  
    return this.el.innerHTML;
  };
  
  
  Editable.prototype.text = function (text) {
    return this.el.textContent.trim();
  };
  
  return Editable;
});
