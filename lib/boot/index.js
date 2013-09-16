
/**
 * Module dependencies.
 */

var Editable = require('editable');
var sanitize = require('editable-sanitize');

var editable = new Editable(document.querySelector('div'));

editable.use(sanitize());
