var Mocha = require('mocha');
var Q = require('q');
var request = require('request');

var mocha = new Mocha();
var counts = {
  total: 0,
  pass: 0,
  fail: 0
};

/**
 * FIXME: We have to set a ridiculous timeout (20 minutes) because Travis’
 * concurrent builds will sometimes exceed Sauce Labs’ concurrency. We should
 * track the following issue to add an option to Travis for limiting
 * concurrency: https://github.com/travis-ci/travis-ci/issues/1963
 */
mocha.timeout(1200000);
mocha.reporter('spec');
mocha.addFile(__dirname + '/main.spec.js');

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
  });
});

runner.on('pass', function () {
  counts.total += 1;
  counts.pass += 1;
});

runner.on('fail', function () {
  counts.total += 1;
  counts.fail += 1;
});
