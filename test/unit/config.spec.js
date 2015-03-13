require('node-amd-require')({
  baseUrl: __dirname,
  paths: {
    'lodash-amd': '../../bower_components/lodash-amd',
    'immutable': '../../bower_components/immutable'
  }
});

var config = require('../../src/config');

var chai = require('chai');
var expect = chai.expect;

describe('config', function(){
	it('should normalise unspecified options', function() {
		expect(config.checkOptions(undefined)).to.exist;
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