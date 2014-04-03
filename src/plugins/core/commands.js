define([
  './commands/indent',
  './commands/insert-html',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/subscript',
  './commands/superscript',
  './commands/undo'
], function (
  indent,
  insertHTML,
  insertList,
  outdent,
  redo,
  subscript,
  superscript,
  undo
) {

  'use strict';

  return {
    indent: indent,
    insertHTML: insertHTML,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    subscript: subscript,
    superscript: superscript,
    undo: undo
  };

});
