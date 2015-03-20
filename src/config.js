define(['lodash-amd/modern/objects/defaults',], function (defaults) {

  var blockModePlugins = [
    'setRootPElement',
    'enforcePElements',
    'ensureSelectableContainers',
  ],
  inlineModePlugins = [
    'inlineElementsMode'
  ],
  defaultOptions = {
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
    ],

    defaultPlugins: blockModePlugins.concat(inlineModePlugins),

    defaultFormatters: [
      'escapeHtmlCharactersFormatter',
      'replaceNbspCharsFormatter'
    ]
  };

  /**
   * Overrides defaults with user's options
   *
   * @param  {Object} userSuppliedOptions The user's options
   * @return {Object}                     The overridden options
   */
  function checkOptions(userSuppliedOptions) {
    var options = userSuppliedOptions || {};

    return Object.freeze(defaults(options, defaultOptions));
  }

  /**
   * Sorts a plugin list by a specified plugin name
   *
   * @param  {String} priorityPlugin The plugin name to be given priority
   * @return {Function}              Sorting function for the given plugin name
   */
  function sortByPlugin(priorityPlugin) {
    return function (pluginCurrent, pluginNext) {
      if (pluginCurrent === priorityPlugin) {
        // pluginCurrent comes before plugin next
        return -1;
      } else if (pluginNext === priorityPlugin) {
        // pluginNext comes before pluginCurrent
        return 1;
      }

      // Do no swap
      return 0;
    }
  }

  /**
   * Filters a list of plugins by block level / inline level mode
   *
   * @param  {Boolean} isBlockLevelMode Whether block level mode is enabled
   * @return {Function}                 Filtering function based upon the given mode
   */
  function filterByBlockLevelMode(isBlockLevelMode) {
    return function (plugin) {
      return (isBlockLevelMode ? blockModePlugins : inlineModePlugins).indexOf(plugin) !== -1;
    }
  }

  return {
    defaultOptions: defaultOptions,
    checkOptions: checkOptions,
    sortByPlugin: sortByPlugin,
    filterByBlockLevelMode: filterByBlockLevelMode
  }
});
