define([
  './commands/insert-list',
  './commands/redo',
  './commands/undo'
], function (
  insertList,
  redo,
  undo
) {

  'use strict';

  return {
    insertList: insertList,
    redo: redo,
    undo: undo
  };

});
