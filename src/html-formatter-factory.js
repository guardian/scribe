define([
  'immutable/dist/immutable',
  './formatter-factory'
], function(Immutable, FormatterFactory) {
  function HTMLFormatterFactory() {
    // Define phases
    // For a list of formatters, see https://github.com/guardian/scribe/issues/126
    this.formatters = {
      // Configurable sanitization of the HTML, e.g. converting/filter/removing
      // elements
      sanitize: Immutable.List(),
      // Normalize content to ensure it is ready for interaction
      normalize: Immutable.List(),
      'export': Immutable.List()
    };
  }

  HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
  HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;

  HTMLFormatterFactory.prototype.register = function(phase, formatter) {
    this.formatters[phase] = this.formatters[phase].push(formatter);
  };

  HTMLFormatterFactory.prototype.format = function (html) {
    return this.formatters.sanitize
      .concat(this.formatters.normalize)
      .reduce(function (formattedData, formatter) {
        return formatter(formattedData);
      }, html);
  };

  HTMLFormatterFactory.prototype.formatForExport = function (html) {
    return this.formatters['export'].reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  return HTMLFormatterFactory;
});
