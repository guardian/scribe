define(function (require) {

  'use strict';

  return {
    indent: require('./commands/indent'),
    insertList: require('./commands/insert-list'),
    outdent: require('./commands/outdent'),
    redo: require('./commands/redo'),
    subscript: require('./commands/subscript'),
    superscript: require('./commands/superscript'),
    undo: require('./commands/undo')
  };

});
