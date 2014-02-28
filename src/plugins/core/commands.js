define([
  './commands/indent',
  './commands/insert-html',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/undo'
], function (
  indent,
  insertHTML,
  insertList,
  outdent,
  redo,
  undo
) {

  'use strict';

  return {
    indent: indent,
    insertHTML: insertHTML,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    undo: undo
  };

});
