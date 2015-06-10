define([
  'immutable/dist/immutable'
], function(Immutable) {
  function FormatterFactory() {
    this.formatters = Immutable.List();
  }

  FormatterFactory.prototype.register = function(formatter) {
    this.formatters = this.formatters.push(formatter);
  }

  FormatterFactory.prototype.format = function (html) {
    // Map the object to an array: Array[Formatter]
    return this.formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  return FormatterFactory;
});
