var Q = require('q');
var request = require('request');

var counts = {
  total: 0,
  pass: 0,
  fail: 0
};

module.exports = function (mocha) {
  var runner = mocha.run(function () {
    // Notify Sauce Labs on whether the suite passed or failed
    var hasPassed = counts.fail === 0;
    Q.ninvoke(request, 'put', {
      json: true,
      url: 'https://saucelabs.com/rest/v1/' + process.env.SAUCE_USERNAME + '/jobs/' + global.sessionID,
      auth: {
        username: process.env.SAUCE_USERNAME,
        password: process.env.SAUCE_ACCESS_KEY
      },
      body: {
        passed: hasPassed
      }
    }).then(function () {
      process.exit(hasPassed ? 0 : 1);
    }).done();
  });

  runner.on('pass', function () {
    counts.total += 1;
    counts.pass += 1;
  });

  runner.on('fail', function () {
    counts.total += 1;
    counts.fail += 1;
  });

  return runner;
};
