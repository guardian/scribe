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
        // If this was the last commit in the transaction and the content
        // does appear to have changed, push the history.
        if (! this.history.length) {
          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      }
    });

    return TransactionManager;
  };
});
