

require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../node_modules/lodash-amd',
    'immutable': '../../node_modules/immutable'
  }
});

var config = require('../../src/config');

var chai = require('chai');
var expect = chai.expect;

describe('config', function() {
  it('should normalise unspecified options', function() {
    expect(config.checkOptions(undefined)).to.exist;
  });

  it('should remove invalid plugins', function() {
    var options = config.checkOptions({
      defaultPlugins: ['bad_plugin'],
      defaultFormatters: ['bad_plugin']
    }),
    dummyPluginList = ['a', 'b'];

    expect(options.defaultPlugins.length).to.be.equal(0);
    expect(options.defaultFormatters.length).to.be.equal(0);
    expect(['a', 'b', 'c'].filter(config.filterByPluginExists(dummyPluginList))).to.not.include('c');
  });

  it('should respect overridden options', function() {
    var checkedOptions = config.checkOptions({allowBlockElements: false});

    expect(checkedOptions.allowBlockElements).to.be.false;
  });

  describe('defaults', function() {
    it('should apply default values', function() {
      var checkedOptions = config.checkOptions({});

      expect(checkedOptions.allowBlockElements).to.be.true;
    });
  });
});
