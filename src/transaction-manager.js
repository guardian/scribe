define(function () {

  'use strict';

  return function (scribe) {
    function TransactionManager() {
      this.history = [];
    }

    TransactionManager.prototype.start = function () {
      this.history.push(1);
    };

    TransactionManager.prototype.end = function () {
      this.history.pop();

      if (this.history.length === 0) {
        scribe.pushHistory();
        scribe.trigger('content-changed');
      }
    };

    TransactionManager.prototype.run = function (transaction, forceMerge) {
      this.start();
      // If there is an error, don't prevent the transaction from ending.
      try {
        if (transaction) {
          transaction();
        }
      } finally {
        scribe._forceMerge = !! forceMerge;
        this.end();
        scribe._forceMerge = false;
      }
    };

    return TransactionManager;
  };
});
