define([
  './commands/indent',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/undo'
], function (
  indent,
  insertList,
  outdent,
  redo,
  undo
) {

  'use strict';

  return {
    indent: indent,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    undo: undo
  };

});
