define(function () {

  'use strict';

  function TransactionManager(scribe) {
    this.history = [];
    this.scribe = scribe;
  }

  TransactionManager.prototype.start = function () {
    this.history.push(1);
  };

  TransactionManager.prototype.end = function () {
    this.history.pop();

    if (this.history.length === 0) {
      this.scribe.pushHistory();
      this.scribe.trigger('content-changed');
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
      this.scribe._forceMerge = !! forceMerge;
      this.end();
      this.scribe._forceMerge = false;
    }
  };

  return TransactionManager;
});
