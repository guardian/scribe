define(['lodash-amd/modern/objects/defaults',], function (defaults) {

	var defaultOptions = {
      allowBlockElements: true,
      debug: false,
      undo: {
        manager: false,
        enabled: true,
        limit: 100,
        interval: 250
      },
      defaultCommandPatches: [
        'bold',
        'indent',
        'insertHTML',
        'insertList',
        'outdent',
        'createLink'
      ]
    };


	function checkOptions(userSuppliedOptions) {
		var options = userSuppliedOptions || {};

		return Object.freeze(defaults(options, defaultOptions));
	}

	return {
		defaultOptions: defaultOptions,
		checkOptions: checkOptions
	}
});