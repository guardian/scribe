
/**
 * Module dependencies.
 */

var exec = require('child_process').exec;

/**
 * Build components.
 *
 * @api public
 */

module.exports = function(req, res, next){
  // you could use the js builder, but
  // this works just fine, though slower
  exec('make', next);
};
