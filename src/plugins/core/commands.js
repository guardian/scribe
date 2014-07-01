define([
  './commands/indent',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/subscript',
  './commands/superscript'
], function (
  indent,
  insertList,
  outdent,
  redo,
  subscript,
  superscript
) {

  'use strict';

  return {
    indent: indent,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    subscript: subscript,
    superscript: superscript
  };

});
