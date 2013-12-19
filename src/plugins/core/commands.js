define([
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/undo'
], function (
  insertList,
  outdent,
  redo,
  undo
) {

  'use strict';

  return {
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    undo: undo
  };

});
