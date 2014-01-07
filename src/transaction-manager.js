define(['lodash-modern/objects/assign'], function (assign) {

  'use strict';

  return function (scribe) {
    function TransactionManager() {
      this.history = [];
    }

    assign(TransactionManager.prototype, {
      start: function () {
        this.history.push(scribe.getContent());
      },

      end: function () {
        this.history.pop();

        if (! this.history.length) {
          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      }
    });

    return TransactionManager;
  };
});
