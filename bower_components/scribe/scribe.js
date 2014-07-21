/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/isNative',[], function() {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  return isNative;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/objectTypes',[], function() {

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  return objectTypes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isObject',['../internals/objectTypes'], function(objectTypes) {

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  return isObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimKeys',['./objectTypes'], function(objectTypes) {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = function(object) {
    var index, iterable = object, result = [];
    if (!iterable) return result;
    if (!(objectTypes[typeof object])) return result;
      for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
          result.push(index);
        }
      }
    return result
  };

  return shimKeys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/keys',['../internals/isNative', './isObject', '../internals/shimKeys'], function(isNative, isObject, shimKeys) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    return nativeKeys(object);
  };

  return keys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/defaults',['./keys', '../internals/objectTypes'], function(keys, objectTypes) {

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to `undefined`. Once a
   * property is set, additional defaults of the same property will be ignored.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param- {Object} [guard] Allows working with `_.reduce` without using its
   *  `key` and `object` arguments as sources.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var object = { 'name': 'barney' };
   * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var defaults = function(object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    var args = arguments,
        argsIndex = 0,
        argsLength = typeof guard == 'number' ? 2 : args.length;
    while (++argsIndex < argsLength) {
      iterable = args[argsIndex];
      if (iterable && objectTypes[typeof iterable]) {
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (typeof result[index] == 'undefined') result[index] = iterable[index];
      }
      }
    }
    return result
  };

  return defaults;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArguments',[], function() {

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == argsClass || false;
  }

  return isArguments;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArray',['../internals/isNative'], function(isNative) {

  /** `Object#toString` result shortcuts */
  var arrayClass = '[object Array]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == arrayClass || false;
  };

  return isArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseFlatten',['../objects/isArguments', '../objects/isArray'], function(isArguments, isArray) {

  /**
   * The base implementation of `_.flatten` without support for callback
   * shorthands or `thisArg` binding.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
   * @param {number} [fromIndex=0] The index to start from.
   * @returns {Array} Returns a new flattened array.
   */
  function baseFlatten(array, isShallow, isStrict, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
      var value = array[index];

      if (value && typeof value == 'object' && typeof value.length == 'number'
          && (isArray(value) || isArguments(value))) {
        // recursively flatten arrays (susceptible to call stack limits)
        if (!isShallow) {
          value = baseFlatten(value, isShallow, isStrict);
        }
        var valIndex = -1,
            valLength = value.length,
            resIndex = result.length;

        result.length += valLength;
        while (++valIndex < valLength) {
          result[resIndex++] = value[valIndex];
        }
      } else if (!isStrict) {
        result.push(value);
      }
    }
    return result;
  }

  return baseFlatten;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/noop',[], function() {

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  return noop;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreate',['./isNative', '../objects/isObject', '../utilities/noop'], function(isNative, isObject, noop) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || window.Object();
      };
    }());
  }

  return baseCreate;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/setBindData',['./isNative', '../utilities/noop'], function(isNative, noop) {

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  return setBindData;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/slice',[], function() {

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  return slice;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseBind',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseBind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateWrapper',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseCreateWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isFunction',[], function() {

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  return isFunction;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/createWrapper',['./baseBind', './baseCreateWrapper', '../objects/isFunction', './slice'], function(baseBind, baseCreateWrapper, isFunction, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push,
      unshift = arrayRef.unshift;

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  return createWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/bind',['../internals/createWrapper', '../internals/slice'], function(createWrapper, slice) {

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  return bind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/identity',[], function() {

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  return identity;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/support',['./internals/isNative'], function(isNative) {

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = {};

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  return support;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateCallback',['../functions/bind', '../utilities/identity', './setBindData', '../support'], function(bind, identity, setBindData, support) {

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString;

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  return baseCreateCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forIn',['../internals/baseCreateCallback', '../internals/objectTypes'], function(baseCreateCallback, objectTypes) {

  /**
   * Iterates over own and inherited enumerable properties of an object,
   * executing the callback for each property. The callback is bound to `thisArg`
   * and invoked with three arguments; (value, key, object). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * Shape.prototype.move = function(x, y) {
   *   this.x += x;
   *   this.y += y;
   * };
   *
   * _.forIn(new Shape, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
   */
  var forIn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      for (index in iterable) {
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forIn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/arrayPool',[], function() {

  /** Used to pool arrays and objects used internally */
  var arrayPool = [];

  return arrayPool;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/getArray',['./arrayPool'], function(arrayPool) {

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  return getArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/maxPoolSize',[], function() {

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  return maxPoolSize;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/releaseArray',['./arrayPool', './maxPoolSize'], function(arrayPool, maxPoolSize) {

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  return releaseArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIsEqual',['../objects/forIn', './getArray', '../objects/isFunction', './objectTypes', './releaseArray'], function(forIn, getArray, isFunction, objectTypes, releaseArray) {

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * The base implementation of `_.isEqual`, without support for `thisArg` binding,
   * that allows partial "_.where" style comparisons.
   *
   * @private
   * @param {*} a The value to compare.
   * @param {*} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
   * @param {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    if (callback) {
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        !(a && objectTypes[type]) &&
        !(b && objectTypes[otherType])) {
      return false;
    }
    // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
    // http://es5.github.io/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
          bWrapped = hasOwnProperty.call(b, '__wrapped__');

      if (aWrapped || bWrapped) {
        return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = a.constructor,
          ctorB = b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result || isWhere) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (isWhere) {
            while (index--) {
              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
        }
      });

      if (result && !isWhere) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  return baseIsEqual;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/property',[], function() {

  /**
   * Creates a "_.pluck" style function, which returns the `key` value of a
   * given object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} key The name of the property to retrieve.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var characters = [
   *   { 'name': 'fred',   'age': 40 },
   *   { 'name': 'barney', 'age': 36 }
   * ];
   *
   * var getName = _.property('name');
   *
   * _.map(characters, getName);
   * // => ['barney', 'fred']
   *
   * _.sortBy(characters, getName);
   * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
   */
  function property(key) {
    return function(object) {
      return object[key];
    };
  }

  return property;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/createCallback',['../internals/baseCreateCallback', '../internals/baseIsEqual', '../objects/isObject', '../objects/keys', '../utilities/property'], function(baseCreateCallback, baseIsEqual, isObject, keys, property) {

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name the created callback will return the property value for a given element.
   * If `func` is an object the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(characters, 'age__gt38');
   * // => [{ 'name': 'fred', 'age': 40 }]
   */
  function createCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (func == null || type == 'function') {
      return baseCreateCallback(func, thisArg, argCount);
    }
    // handle "_.pluck" style callback shorthands
    if (type != 'object') {
      return property(func);
    }
    var props = keys(func),
        key = props[0],
        a = func[key];

    // handle "_.where" style callback shorthands
    if (props.length == 1 && a === a && !isObject(a)) {
      // fast path the common case of providing an object with a single
      // property containing a primitive value
      return function(object) {
        var b = object[key];
        return a === b && (a !== 0 || (1 / a == 1 / b));
      };
    }
    return function(object) {
      var length = props.length,
          result = false;

      while (length--) {
        if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
          break;
        }
      }
      return result;
    };
  }

  return createCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forOwn',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forOwn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/map',['../functions/createCallback', '../objects/forOwn'], function(createCallback, forOwn) {

  /**
   * Creates an array of values by running each element in the collection
   * through the callback. The callback is bound to `thisArg` and invoked with
   * three arguments; (value, index|key, collection).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @alias collect
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of the results of each `callback` execution.
   * @example
   *
   * _.map([1, 2, 3], function(num) { return num * 3; });
   * // => [3, 6, 9]
   *
   * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
   * // => [3, 6, 9] (property order is not guaranteed across environments)
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.map(characters, 'name');
   * // => ['barney', 'fred']
   */
  function map(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0;

    callback = createCallback(callback, thisArg, 3);
    if (typeof length == 'number') {
      var result = Array(length);
      while (++index < length) {
        result[index] = callback(collection[index], index, collection);
      }
    } else {
      result = [];
      forOwn(collection, function(value, key, collection) {
        result[++index] = callback(value, key, collection);
      });
    }
    return result;
  }

  return map;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/flatten',['../internals/baseFlatten', '../collections/map'], function(baseFlatten, map) {

  /**
   * Flattens a nested array (the nesting can be to any depth). If `isShallow`
   * is truey, the array will only be flattened a single level. If a callback
   * is provided each element of the array is passed through the callback before
   * flattening. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, index, array).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new flattened array.
   * @example
   *
   * _.flatten([1, [2], [3, [[4]]]]);
   * // => [1, 2, 3, 4];
   *
   * _.flatten([1, [2], [3, [[4]]]], true);
   * // => [1, 2, 3, [[4]]];
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
   *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.flatten(characters, 'pets');
   * // => ['hoppy', 'baby puss', 'dino']
   */
  function flatten(array, isShallow, callback, thisArg) {
    // juggle arguments
    if (typeof isShallow != 'boolean' && isShallow != null) {
      thisArg = callback;
      callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
      isShallow = false;
    }
    if (callback != null) {
      array = map(array, callback, thisArg);
    }
    return baseFlatten(array, isShallow);
  }

  return flatten;
});

define('plugins/core/commands/indent',[],function () {

  

  return function () {
    return function (scribe) {
      var indentCommand = new scribe.api.Command('indent');

      indentCommand.queryEnabled = function () {
        /**
         * FIXME: Chrome nests ULs inside of ULs
         * Currently we just disable the command when the selection is inside of
         * a list.
         * As per: http://jsbin.com/ORikUPa/3/edit?html,js,output
         */
        var selection = new scribe.api.Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.indent = indentCommand;
    };
  };

});

define('plugins/core/commands/insert-list',[],function () {

  /**
   * If the paragraphs option is set to true, then when the list is
   * unapplied, ensure that we enter a P element.
   */

  

  return function () {
    return function (scribe) {
      var InsertListCommand = function (commandName) {
        scribe.api.Command.call(this, commandName);
      };

      InsertListCommand.prototype = Object.create(scribe.api.Command.prototype);
      InsertListCommand.prototype.constructor = InsertListCommand;

      InsertListCommand.prototype.execute = function (value) {
        function splitList(listItemElements) {
          if (listItemElements.length > 0) {
            var newListNode = document.createElement(listNode.nodeName);

            listItemElements.forEach(function (listItemElement) {
              newListNode.appendChild(listItemElement);
            });

            listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
          }
        }

        if (this.queryState()) {
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          var listItemElement = selection.getContaining(function (node) {
            return node.nodeName === 'LI';
          });

          scribe.transactionManager.run(function () {
            if (listItemElement) {
              var nextListItemElements = (new scribe.api.Node(listItemElement)).nextAll();

              /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(nextListItemElements);

              /**
               * Insert a paragraph in place of the list item.
               */

              selection.placeMarkers();

              var pNode = document.createElement('p');
              pNode.innerHTML = listItemElement.innerHTML;

              listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
              listItemElement.parentNode.removeChild(listItemElement);
            } else {
              /**
               * When multiple list items are selected, we replace each list
               * item with a paragraph.
               */

              // We can't query for list items in the selection so we loop
              // through them all and find the intersection ourselves.
              var selectedListItemElements = Array.prototype.map.call(listNode.querySelectorAll('li'),
                function (listItemElement) {
                return range.intersectsNode(listItemElement) && listItemElement;
              }).filter(function (listItemElement) {
                // TODO: identity
                return listItemElement;
              });
              var lastSelectedListItemElement = selectedListItemElements.slice(-1)[0];
              var listItemElementsAfterSelection = (new scribe.api.Node(lastSelectedListItemElement)).nextAll();

              /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(listItemElementsAfterSelection);

              // Store the caret/range positioning inside of the list items so
              // we can restore it from the newly created P elements soon
              // afterwards.
              selection.placeMarkers();

              var documentFragment = document.createDocumentFragment();
              selectedListItemElements.forEach(function (listItemElement) {
                var pElement = document.createElement('p');
                pElement.innerHTML = listItemElement.innerHTML;
                documentFragment.appendChild(pElement);
              });

              // Insert the Ps
              listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);

              // Remove the LIs
              selectedListItemElements.forEach(function (listItemElement) {
                listItemElement.parentNode.removeChild(listItemElement);
              });
            }

            // If the list is now empty, clean it up.
            if (listNode.childNodes.length === 0) {
              listNode.parentNode.removeChild(listNode);
            }

            selection.selectMarkers();
          }.bind(this));
        } else {
          scribe.api.Command.prototype.execute.call(this, value);
        }
      };

      InsertListCommand.prototype.queryEnabled = function () {
        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements();
      };

      scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
      scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
    };
  };

});

define('plugins/core/commands/outdent',[],function () {

  

  return function () {
    return function (scribe) {
      var outdentCommand = new scribe.api.Command('outdent');

      outdentCommand.queryEnabled = function () {
        /**
         * FIXME: If the paragraphs option is set to true, then when the
         * list is unapplied, ensure that we enter a P element.
         * Currently we just disable the command when the selection is inside of
         * a list.
         */
        var selection = new scribe.api.Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        // FIXME: define block element rule here?
        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.outdent = outdentCommand;
    };
  };

});

define('plugins/core/commands/redo',[],function () {

  

  return function () {
    return function (scribe) {
      var redoCommand = new scribe.api.Command('redo');

      redoCommand.execute = function () {
        var historyItem = scribe.undoManager.redo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      redoCommand.queryEnabled = function () {
        return scribe.undoManager.position < scribe.undoManager.stack.length - 1;
      };

      scribe.commands.redo = redoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
          event.preventDefault();
          redoCommand.execute();
        }
      });
    };
  };

});

define('plugins/core/commands/subscript',[],function () {

  

  return function () {
    return function (scribe) {
      var subscriptCommand = new scribe.api.Command('subscript');

      scribe.commands.subscript = subscriptCommand;
    };
  };

});

define('plugins/core/commands/superscript',[],function () {

  

  return function () {
    return function (scribe) {
      var superscriptCommand = new scribe.api.Command('superscript');

      scribe.commands.superscript = superscriptCommand;
    };
  };

});

define('plugins/core/commands/undo',[],function () {

  

  return function () {
    return function (scribe) {
      var undoCommand = new scribe.api.Command('undo');

      undoCommand.execute = function () {
        var historyItem = scribe.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position > 1;
      };

      scribe.commands.undo = undoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        // TODO: use lib to abstract meta/ctrl keys?
        if (! event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
          event.preventDefault();
          undoCommand.execute();
        }
      });
    };
  };

});

define('plugins/core/commands',[
  './commands/indent',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/subscript',
  './commands/superscript',
  './commands/undo'
], function (
  indent,
  insertList,
  outdent,
  redo,
  subscript,
  superscript,
  undo
) {

  

  return {
    indent: indent,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    subscript: subscript,
    superscript: superscript,
    undo: undo
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIndexOf',[], function() {

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  return baseIndexOf;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isString',[], function() {

  /** `Object#toString` result shortcuts */
  var stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('fred');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' ||
      value && typeof value == 'object' && toString.call(value) == stringClass || false;
  }

  return isString;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/contains',['../internals/baseIndexOf', '../objects/forOwn', '../objects/isArray', '../objects/isString'], function(baseIndexOf, forOwn, isArray, isString) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeMax = Math.max;

  /**
   * Checks if a given value is present in a collection using strict equality
   * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
   * offset from the end of the collection.
   *
   * @static
   * @memberOf _
   * @alias include
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {*} target The value to check for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
   * @example
   *
   * _.contains([1, 2, 3], 1);
   * // => true
   *
   * _.contains([1, 2, 3], 1, 2);
   * // => false
   *
   * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
   * // => true
   *
   * _.contains('pebbles', 'eb');
   * // => true
   */
  function contains(collection, target, fromIndex) {
    var index = -1,
        indexOf = baseIndexOf,
        length = collection ? collection.length : 0,
        result = false;

    fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
    if (isArray(collection)) {
      result = indexOf(collection, target, fromIndex) > -1;
    } else if (typeof length == 'number') {
      result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
    } else {
      forOwn(collection, function(value) {
        if (++index >= fromIndex) {
          return !(result = value === target);
        }
      });
    }
    return result;
  }

  return contains;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/values',['./keys'], function(keys) {

  /**
   * Creates an array composed of the own enumerable property values of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property values.
   * @example
   *
   * _.values({ 'one': 1, 'two': 2, 'three': 3 });
   * // => [1, 2, 3] (property order is not guaranteed across environments)
   */
  function values(object) {
    var index = -1,
        props = keys(object),
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  return values;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/toArray',['../objects/isString', '../internals/slice', '../objects/values'], function(isString, slice, values) {

  /**
   * Converts the `collection` to an array.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to convert.
   * @returns {Array} Returns the new converted array.
   * @example
   *
   * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
   * // => [2, 3, 4]
   */
  function toArray(collection) {
    if (collection && typeof collection.length == 'number') {
      return slice(collection);
    }
    return values(collection);
  }

  return toArray;
});

define('scribe-common/src/element',['lodash-amd/modern/collections/contains'], function (contains) {

  

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6'];
  function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
  }

  function isSelectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
      node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    unwrap: unwrap
  };

});

define('scribe-common/src/node',[], function () {

  

  function isEmptyTextNode(node) {
    return (node.nodeType === Node.TEXT_NODE && node.textContent === '');
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  return {
    isEmptyTextNode: isEmptyTextNode,
    insertAfter: insertAfter,
    removeNode: removeNode
  };

});

define('dom-observer',[
  'lodash-amd/modern/arrays/flatten',
  'lodash-amd/modern/collections/toArray',
  'scribe-common/src/element',
  'scribe-common/src/node'
], function (
  flatten,
  toArray,
  elementHelpers,
  nodeHelpers
) {

  function observeDomChanges(el, callback) {
    function includeRealMutations(mutations) {
      var allChangedNodes = flatten(mutations.map(function(mutation) {
        var added   = toArray(mutation.addedNodes);
        var removed = toArray(mutation.removedNodes);
        return added.concat(removed);
      }));

      var realChangedNodes = allChangedNodes.
        filter(function(n) { return ! nodeHelpers.isEmptyTextNode(n); }).
        filter(function(n) { return ! elementHelpers.isSelectionMarkerNode(n); });

      return realChangedNodes.length > 0;
    }

    // Flag to avoid running recursively
    var runningPostMutation = false;
    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        } finally {
          // We must yield to let any mutation we caused be triggered
          // in the next cycle
          setTimeout(function() {
            runningPostMutation = false;
          }, 0);
        }
      }
    });

    observer.observe(el, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return observer;
  }

  return observeDomChanges;
});

define('plugins/core/events',[
  'lodash-amd/modern/collections/contains',
  '../../dom-observer'
], function (
  contains,
  observeDomChanges
) {

  

  return function () {
    return function (scribe) {
      /**
       * Push the first history item when the editor is focused.
       */
      var pushHistoryOnFocus = function () {
        // Tabbing into the editor doesn't create a range immediately, so we
        // have to wait until the next event loop.
        setTimeout(function () {
          scribe.pushHistory();
        }.bind(scribe), 0);

        scribe.el.removeEventListener('focus', pushHistoryOnFocus);
      }.bind(scribe);
      scribe.el.addEventListener('focus', pushHistoryOnFocus);

      /**
       * Firefox: Giving focus to a `contenteditable` will place the caret
       * outside of any block elements. Chrome behaves correctly by placing the
       * caret at the  earliest point possible inside the first block element.
       * As per: http://jsbin.com/eLoFOku/1/edit?js,console,output
       *
       * We detect when this occurs and fix it by placing the caret ourselves.
       */
      scribe.el.addEventListener('focus', function placeCaretOnFocus() {
        var selection = new scribe.api.Selection();
        // In Chrome, the range is not created on or before this event loop.
        // It doesn’t matter because this is a fix for Firefox.
        if (selection.range) {
          selection.placeMarkers();
          var isFirefoxBug = scribe.allowsBlockElements() && scribe.getHTML().match(/^<em class="scribe-marker"><\/em>/);
          selection.removeMarkers();

          if (isFirefoxBug) {
            var focusElement = getFirstDeepestChild(scribe.el.firstChild);

            var range = selection.range;

            range.setStart(focusElement, 0);
            range.setEnd(focusElement, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(range);
          }
        }

        function getFirstDeepestChild(node) {
          var treeWalker = document.createTreeWalker(node);
          var previousNode = treeWalker.currentNode;
          if (treeWalker.firstChild()) {
            // TODO: build list of non-empty elements (used elsewhere)
            // Do not include non-empty elements
            if (treeWalker.currentNode.nodeName === 'BR') {
              return previousNode;
            } else {
              return getFirstDeepestChild(treeWalker.currentNode);
            }
          } else {
            return treeWalker.currentNode;
          }
        }
      }.bind(scribe));

      /**
       * Apply the formatters when there is a DOM mutation.
       */
      var applyFormatters = function() {
        if (!scribe._skipFormatters) {
          var selection = new scribe.api.Selection();
          var isEditorActive = selection.range;

          var runFormatters = function () {
            if (isEditorActive) {
              selection.placeMarkers();
            }
            scribe.setHTML(scribe._htmlFormatterFactory.format(scribe.getHTML()));
            selection.selectMarkers();
          }.bind(scribe);

          // We only want to wrap the formatting in a transaction if the editor is
          // active. If the DOM is mutated when the editor isn't active (e.g.
          // `scribe.setContent`), we do not want to push to the history. (This
          // happens on the first `focus` event).
          if (isEditorActive) {
            // Discard the last history item, as we're going to be adding
            // a new clean history item next.
            scribe.undoManager.undo();

            // Pass content through formatters, place caret back
            scribe.transactionManager.run(runFormatters);
          } else {
            runFormatters();
          }

        }

        delete scribe._skipFormatters;
      }.bind(scribe);

      observeDomChanges(scribe.el, applyFormatters);

      // TODO: disconnect on tear down:
      // observer.disconnect();

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var selection = new scribe.api.Selection();
            var range = selection.range;

            var headingNode = selection.getContaining(function (node) {
              return (/^(H[1-6])$/).test(node.nodeName);
            });

            /**
             * If we are at the end of the heading, insert a P. Otherwise handle
             * natively.
             */
            if (headingNode && range.collapsed) {
              var contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(headingNode, 0);

              // Get the content from the range to the end of the heading
              var contentToEndFragment = contentToEndRange.cloneContents();

              if (contentToEndFragment.firstChild.textContent === '') {
                event.preventDefault();

                scribe.transactionManager.run(function () {
                  // Default P
                  // TODO: Abstract somewhere
                  var pNode = document.createElement('p');
                  var brNode = document.createElement('br');
                  pNode.appendChild(brNode);

                  headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);

                  // Re-apply range
                  range.setStart(pNode, 0);
                  range.setEnd(pNode, 0);

                  selection.selection.removeAllRanges();
                  selection.selection.addRange(range);
                });
              }
            }
          }
        });
      }

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside list item nodes.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13 || event.keyCode === 8) { // enter || backspace

            var selection = new scribe.api.Selection();
            var range = selection.range;

            if (range.collapsed) {
              var containerLIElement = selection.getContaining(function (node) {
                return node.nodeName === 'LI';
              });
              if (containerLIElement && containerLIElement.textContent.trim() === '') {
                /**
                 * LIs
                 */

                event.preventDefault();

                var listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.execute();
              }
            }
          }
        });
      }

      /**
       * We have to hijack the paste event to ensure it uses
       * `scribe.insertHTML`, which executes the Scribe version of the command
       * and also runs the formatters.
       */

      /**
       * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
       * I also don't like how it has the authority to perform `event.preventDefault`.
       */

      scribe.el.addEventListener('paste', function handlePaste(event) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * will execute the second branch here.
         */
        if (event.clipboardData) {
          event.preventDefault();

          if (contains(event.clipboardData.types, 'text/html')) {

            scribe.insertHTML(event.clipboardData.getData('text/html'));
          } else {
            scribe.insertPlainText(event.clipboardData.getData('text/plain'));
          }
        } else {
          /**
           * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
           * sequence of events:
           *
           *   - Save the text selection
           *   - Focus another, hidden textarea so we paste there
           *   - Copy the pasted content of said textarea
           *   - Give focus back to the scribe
           *   - Restore the text selection
           *
           * This is required because, without access to the Clipboard API, there is literally
           * no other way to manipulate content on paste.
           * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
           *
           * Firefox <= 21
           * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent.clipboardData
           */

          var selection = new scribe.api.Selection();

          // Store the caret position
          selection.placeMarkers();

          var bin = document.createElement('div');
          document.body.appendChild(bin);
          bin.setAttribute('contenteditable', true);
          bin.focus();

          // Wait for the paste to happen (next loop?)
          setTimeout(function () {
            var data = bin.innerHTML;
            bin.parentNode.removeChild(bin);

            // Restore the caret position
            selection.selectMarkers();
            /**
             * Firefox 19 (and maybe others): even though the applied range
             * exists within the Scribe instance, we need to focus it.
             */
            scribe.el.focus();

            scribe.insertHTML(data);
          }, 1);
        }
      });

    };
  };
});

define('plugins/core/formatters/html/replace-nbsp-chars',[],function () {

  /**
   * Chrome:
   */

  

  return function () {
    return function (scribe) {
      var nbspCharRegExp = /(\s|&nbsp;)+/g;

      // TODO: should we be doing this on paste?
      scribe.registerHTMLFormatter('export', function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/last',['../functions/createCallback', '../internals/slice'], function(createCallback, slice) {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeMax = Math.max;

  /**
   * Gets the last element or last `n` elements of an array. If a callback is
   * provided elements at the end of the array are returned as long as the
   * callback returns truey. The callback is bound to `thisArg` and invoked
   * with three arguments; (value, index, array).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Function|Object|number|string} [callback] The function called
   *  per element or the number of elements to return. If a property name or
   *  object is provided it will be used to create a "_.pluck" or "_.where"
   *  style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {*} Returns the last element(s) of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   *
   * _.last([1, 2, 3], 2);
   * // => [2, 3]
   *
   * _.last([1, 2, 3], function(num) {
   *   return num > 1;
   * });
   * // => [2, 3]
   *
   * var characters = [
   *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
   *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
   *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.pluck(_.last(characters, 'blocked'), 'name');
   * // => ['fred', 'pebbles']
   *
   * // using "_.where" callback shorthand
   * _.last(characters, { 'employer': 'na' });
   * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
   */
  function last(array, callback, thisArg) {
    var n = 0,
        length = array ? array.length : 0;

    if (typeof callback != 'number' && callback != null) {
      var index = length;
      callback = createCallback(callback, thisArg, 3);
      while (index-- && callback(array[index], index, array)) {
        n++;
      }
    } else {
      n = callback;
      if (n == null || thisArg) {
        return array ? array[length - 1] : undefined;
      }
    }
    return slice(array, nativeMax(0, length - n));
  }

  return last;
});

define('plugins/core/formatters/html/enforce-p-elements',[
  'lodash-amd/modern/arrays/last',
  'scribe-common/src/element'
], function (
  last,
  element
) {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the
   * browser deletes the paragraph element, leaving the caret (and any
   * content) outside of any P.
   *
   * Firefox: Erasing across multiple paragraphs, or outside of a
   * whole paragraph (e.g. by ‘Select All’) will leave content outside
   * of any P.
   *
   * Entering a new line in a pristine state state will insert
   * `<div>`s (in Chrome) or `<br>`s (in Firefox) where previously we
   * had `<p>`'s. This patches the behaviour of delete/backspace so
   * that we do not end up in a pristine state.
   */

  

  /**
   * Wrap consecutive inline elements and text nodes in a P element.
   */
  function wrapChildNodes(parentNode) {
    var groups = Array.prototype.reduce.call(parentNode.childNodes,
                                             function (accumulator, binChildNode) {
      var group = last(accumulator);
      if (! group) {
        startNewGroup();
      } else {
        var isBlockGroup = element.isBlockElement(group[0]);
        if (isBlockGroup === element.isBlockElement(binChildNode)) {
          group.push(binChildNode);
        } else {
          startNewGroup();
        }
      }

      return accumulator;

      function startNewGroup() {
        var newGroup = [binChildNode];
        accumulator.push(newGroup);
      }
    }, []);

    var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
      var isBlockGroup = element.isBlockElement(group[0]);
      return ! isBlockGroup;
    });

    consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
      var pElement = document.createElement('p');
      nodes[0].parentNode.insertBefore(pElement, nodes[0]);
      nodes.forEach(function (node) {
        pElement.appendChild(node);
      });
    });

    parentNode._isWrapped = true;
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
    var node = treeWalker.firstChild();

    // FIXME: does this recurse down?

    while (node) {
      // TODO: At the moment we only support BLOCKQUOTEs. See failing
      // tests.
      if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
        wrapChildNodes(node);
        traverse(parentNode);
        break;
      }
      node = treeWalker.nextSibling();
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        /**
         * Ensure P mode.
         *
         * Wrap any orphan text nodes in a P element.
         */
        // TODO: This should be configurable and also correct markup such as
        // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
        // TODO: This should probably be a part of HTML Janitor, or some other
        // formatter.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        wrapChildNodes(bin);
        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});

define('plugins/core/formatters/html/ensure-selectable-containers',[
    'scribe-common/src/element',
    'lodash-amd/modern/collections/contains'
  ], function (
    element,
    contains
  ) {

  /**
   * Chrome and Firefox: All elements need to contain either text or a `<br>` to
   * remain selectable. (Unless they have a width and height explicitly set with
   * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
   */

  

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
  var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

  function traverse(parentNode) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    function isEmpty(node) {
      return node.children.length === 0
        || (node.children.length === 1
            && element.isSelectionMarkerNode(node.children[0]));
    }

    while (node) {
      if (!element.isSelectionMarkerNode(node)) {
        // Find any node that contains no child *elements*, or just contains
        // whitespace, and is not self-closing
        if (isEmpty(node) &&
          node.textContent.trim() === '' &&
          !contains(html5VoidElements, node.nodeName))
        {
          node.appendChild(document.createElement('br'));
        } else if (node.children.length > 0) {
          traverse(node);
        }
      }
      node = node.nextElementSibling;
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/htmlEscapes',[], function() {

  /**
   * Used to convert characters to HTML entities:
   *
   * Though the `>` character is escaped for symmetry, characters like `>` and `/`
   * don't require escaping in HTML and have no special meaning unless they're part
   * of a tag or an unquoted attribute value.
   * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
   */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return htmlEscapes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/escapeHtmlChar',['./htmlEscapes'], function(htmlEscapes) {

  /**
   * Used by `escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeHtmlChar(match) {
    return htmlEscapes[match];
  }

  return escapeHtmlChar;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/reUnescapedHtml',['./htmlEscapes', '../objects/keys'], function(htmlEscapes, keys) {

  /** Used to match HTML entities and HTML characters */
  var reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

  return reUnescapedHtml;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/escape',['../internals/escapeHtmlChar', '../objects/keys', '../internals/reUnescapedHtml'], function(escapeHtmlChar, keys, reUnescapedHtml) {

  /**
   * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
   * corresponding HTML entities.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} string The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('Fred, Wilma, & Pebbles');
   * // => 'Fred, Wilma, &amp; Pebbles'
   */
  function escape(string) {
    return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
  }

  return escape;
});

define('plugins/core/formatters/plain-text/escape-html-characters',[
  'lodash-amd/modern/utilities/escape'
], function (
  escape
) {

  

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(escape);
    };
  };

});

define('plugins/core/inline-elements-mode',[],function () {

  

  // TODO: abstract
  function hasContent(rootNode) {
    var treeWalker = document.createTreeWalker(rootNode);

    while (treeWalker.nextNode()) {
      if (treeWalker.currentNode) {
        // If the node is a non-empty element or has content
        if (~['br'].indexOf(treeWalker.currentNode.nodeName.toLowerCase()) || treeWalker.currentNode.length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  return function () {
    return function (scribe) {
      /**
       * Firefox has a `insertBrOnReturn` command, but this is not a part of
       * any standard. One day we might have an `insertLineBreak` command,
       * proposed by this spec:
       * https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-insertlinebreak-command
       * As per: http://jsbin.com/IQUraXA/1/edit?html,js,output
       */
      scribe.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { // enter
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var blockNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI' || (/^(H[1-6])$/).test(node.nodeName);
          });

          if (! blockNode) {
            event.preventDefault();

            scribe.transactionManager.run(function () {
              /**
               * Firefox: Delete the bogus BR as we insert another one later.
               * We have to do this because otherwise the browser will believe
               * there is content to the right of the selection.
               */
              if (scribe.el.lastChild.nodeName === 'BR') {
                scribe.el.removeChild(scribe.el.lastChild);
              }

              var brNode = document.createElement('br');

              range.insertNode(brNode);
              // After inserting the BR into the range is no longer collapsed, so
              // we have to collapse it again.
              // TODO: Older versions of Firefox require this argument even though
              // it is supposed to be optional. Proxy/polyfill?
              range.collapse(false);

              /**
               * Chrome: If there is no right-hand side content, inserting a BR
               * will not appear to create a line break.
               * Firefox: If there is no right-hand side content, inserting a BR
               * will appear to create a weird "half-line break".
               *
               * Possible solution: Insert two BRs.
               * ✓ Chrome: Inserting two BRs appears to create a line break.
               * Typing will then delete the bogus BR element.
               * Firefox: Inserting two BRs will create two line breaks.
               *
               * Solution: Only insert two BRs if there is no right-hand
               * side content.
               *
               * If the user types on a line immediately after a BR element,
               * Chrome will replace the BR element with the typed characters,
               * whereas Firefox will not. Thus, to satisfy Firefox we have to
               * insert a bogus BR element on initialization (see below).
               */

              var contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(scribe.el.lastChild, 0);

              // Get the content from the range to the end of the heading
              var contentToEndFragment = contentToEndRange.cloneContents();

              // If there is not already a right hand side content we need to
              // insert a bogus BR element.
              if (! hasContent(contentToEndFragment)) {
                var bogusBrNode = document.createElement('br');
                range.insertNode(bogusBrNode);
              }

              var newRange = range.cloneRange();

              newRange.setStartAfter(brNode, 0);
              newRange.setEndAfter(brNode, 0);

              selection.selection.removeAllRanges();
              selection.selection.addRange(newRange);
            });
          }
        }
      }.bind(this));

      if (scribe.getHTML().trim() === '') {
        // Bogus BR element for Firefox — see explanation above.
        // TODO: also append when consumer sets the content manually.
        // TODO: hide when the user calls `getHTML`?
        scribe.setContent('');
      }
    };
  };
});

define('plugins/core/patches/commands/bold',[],function () {

  

  return function () {
    return function (scribe) {
      var boldCommand = new scribe.api.CommandPatch('bold');

      /**
       * Chrome: Executing the bold command inside a heading corrupts the markup.
       * Disabling for now.
       */
      boldCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        var headingNode = selection.getContaining(function (node) {
          return (/^(H[1-6])$/).test(node.nodeName);
        });

        return scribe.api.CommandPatch.prototype.queryEnabled.apply(this, arguments) && ! headingNode;
      };

      // TODO: We can't use STRONGs because this would mean we have to
      // re-implement the `queryState` command, which would be difficult.

      scribe.commandPatches.bold = boldCommand;
    };
  };

});

define('plugins/core/patches/commands/indent',[],function () {

  /**
   * Prevent Chrome from inserting BLOCKQUOTEs inside of Ps, and also from
   * adding a redundant `style` attribute to the created BLOCKQUOTE.
   */

  

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (scribe) {
      var indentCommand = new scribe.api.CommandPatch('indent');

      indentCommand.execute = function (value) {
        scribe.transactionManager.run(function () {
          /**
           * Chrome: If we apply the indent command on an empty P, the
           * BLOCKQUOTE will be nested inside the P.
           * As per: http://jsbin.com/oDOriyU/3/edit?html,js,output
           */
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var isCaretOnNewLine =
              (range.commonAncestorContainer.nodeName === 'P'
               && range.commonAncestorContainer.innerHTML === '<br>');
          if (isCaretOnNewLine) {
            // FIXME: this text node is left behind. Tidy it up somehow,
            // or don't use it at all.
            var textNode = document.createTextNode(INVISIBLE_CHAR);

            range.insertNode(textNode);

            range.setStart(textNode, 0);
            range.setEnd(textNode, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(range);
          }

          scribe.api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: The BLOCKQUOTE created contains a redundant style attribute.
           * As per: http://jsbin.com/AkasOzu/1/edit?html,js,output
           */

          // Renew the selection
          selection = new scribe.api.Selection();
          var blockquoteNode = selection.getContaining(function (node) {
            return node.nodeName === 'BLOCKQUOTE';
          });

          if (blockquoteNode) {
            blockquoteNode.removeAttribute('style');
          }
        }.bind(this));
      };

      scribe.commandPatches.indent = indentCommand;
    };
  };

});

define('plugins/core/patches/commands/insert-html',['scribe-common/src/element'], function (element) {

  

  return function () {
    return function (scribe) {
      var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

      insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: If a parent node has a CSS `line-height` when we apply the
           * insertHTML command, Chrome appends a SPAN to plain content with
           * inline styling replicating that `line-height`, and adjusts the
           * `line-height` on inline elements.
           * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
           *
           * FIXME: what if the user actually wants to use SPANs? This could
           * cause conflicts.
           */

          // TODO: share somehow with similar event patch for P nodes
          sanitize(scribe.el);

          function sanitize(parentNode) {
            var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
            var node = treeWalker.firstChild();
            if (!node) { return; }

            do {
              if (node.nodeName === 'SPAN') {
                element.unwrap(parentNode, node);
              } else {
                /**
                 * If the list item contains inline elements such as
                 * A, B, or I, Chrome will also append an inline style for
                 * `line-height` on those elements, so we remove it here.
                 */
                node.style.lineHeight = null;

                // There probably wasn’t a `style` attribute before, so
                // remove it if it is now empty.
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
              }

              // Sanitize children
              sanitize(node);
            } while ((node = treeWalker.nextSibling()));
          }
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };

});

define('plugins/core/patches/commands/insert-list',['scribe-common/src/element',
        'scribe-common/src/node'], function (element, nodeHelpers) {

  

  return function () {
    return function (scribe) {
      var InsertListCommandPatch = function (commandName) {
        scribe.api.CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(scribe.api.CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          if (this.queryState()) {
            var selection = new scribe.api.Selection();

            var listElement = selection.getContaining(function (node) {
              return node.nodeName === 'OL' || node.nodeName === 'UL';
            });


            /**
             * Firefox: If we apply the insertOrderedList or the insertUnorderedList
             * command on an empty block, a P will be inserted after the OL/UL.
             * As per: http://jsbin.com/cubacoli/3/edit?html,js,output
             */

            if (listElement.nextElementSibling &&
                listElement.nextElementSibling.childNodes.length === 0) {
              nodeHelpers.removeNode(listElement.nextElementSibling);
            }

            /**
             * Chrome: If we apply the insertOrderedList or the insertUnorderedList
             * command on an empty block, the OL/UL will be nested inside the block.
             * As per: http://jsbin.com/eFiRedUc/1/edit?html,js,output
             */

            if (listElement) {
              var listParentNode = listElement.parentNode;
              // If list is within a text block then split that block
              if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                selection.placeMarkers();
                // Move listElement out of the block
                nodeHelpers.insertAfter(listElement, listParentNode);
                selection.selectMarkers();

                /**
                 * Chrome 27-34: An empty text node is inserted.
                 */
                if (listParentNode.childNodes.length === 2 &&
                    nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                  nodeHelpers.removeNode(listParentNode);
                }

                // Remove the block if it's empty
                if (listParentNode.childNodes.length === 0) {
                  nodeHelpers.removeNode(listParentNode);
                }
              }
            }

            /**
             * Chrome: If a parent node has a CSS `line-height` when we apply the
             * insertOrderedList or the insertUnorderedList command, Chrome appends
             * a SPAN to LIs with inline styling replicating that `line-height`.
             * As per: http://jsbin.com/OtemujAY/7/edit?html,css,js,output
             *
             * FIXME: what if the user actually wants to use SPANs? This could
             * cause conflicts.
             */

            // TODO: share somehow with similar event patch for P nodes
            var listItemElements = Array.prototype.slice.call(listElement.childNodes);
            listItemElements.forEach(function(listItemElement) {
              // We clone the childNodes into an Array so that it's
              // not affected by any manipulation below when we
              // iterate over it
              var listItemElementChildNodes = Array.prototype.slice.call(listItemElement.childNodes);
              listItemElementChildNodes.forEach(function(listElementChildNode) {
                if (listElementChildNode.nodeName === 'SPAN') {
                  // Unwrap any SPAN that has been inserted
                  var spanElement = listElementChildNode;
                  element.unwrap(listItemElement, spanElement);
                } else if (listElementChildNode.nodeType === Node.ELEMENT_NODE) {
                  /**
                   * If the list item contains inline elements such as
                   * A, B, or I, Chrome will also append an inline style for
                   * `line-height` on those elements, so we remove it here.
                   */
                  listElementChildNode.style.lineHeight = null;

                  // There probably wasn’t a `style` attribute before, so
                  // remove it if it is now empty.
                  if (listElementChildNode.getAttribute('style') === '') {
                    listElementChildNode.removeAttribute('style');
                  }
                }
              });
            });
          }
        }.bind(this));
      };

      scribe.commandPatches.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      scribe.commandPatches.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});

define('plugins/core/patches/commands/outdent',[],function () {

  /**
   * Prevent Chrome from removing formatting of BLOCKQUOTE contents.
   */

  

  return function () {
    return function (scribe) {
      var outdentCommand = new scribe.api.CommandPatch('outdent');

      outdentCommand.execute = function () {
        scribe.transactionManager.run(function () {
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var blockquoteNode = selection.getContaining(function (node) {
            return node.nodeName === 'BLOCKQUOTE';
          });

          if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
            /**
             * Chrome: Applying the outdent command when a whole BLOCKQUOTE is
             * selected removes the formatting of its contents.
             * As per: http://jsbin.com/okAYaHa/1/edit?html,js,output
             */

            // Insert a copy of the selection before the BLOCKQUOTE, and then
            // restore the selection on the copy.
            selection.placeMarkers();
            // We want to copy the selected nodes *with* the markers
            selection.selectMarkers(true);
            var selectedNodes = range.cloneContents();
            blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
            range.deleteContents();
            selection.selectMarkers();

            // Delete the BLOCKQUOTE if it's empty
            if (blockquoteNode.textContent === '') {
              blockquoteNode.parentNode.removeChild(blockquoteNode);
            }
          } else {
            /**
             * Chrome: If we apply the outdent command on a P, the contents of the
             * P will be outdented instead of the whole P element.
             * As per: http://jsbin.com/IfaRaFO/1/edit?html,js,output
             */

            var pNode = selection.getContaining(function (node) {
              return node.nodeName === 'P';
            });

            if (pNode) {
              /**
               * If we are not at the start of end of a BLOCKQUOTE, we have to
               * split the node and insert the P in the middle.
               */

              var nextSiblingNodes = (new scribe.api.Node(pNode)).nextAll();

              if (nextSiblingNodes.length) {
                var newContainerNode = document.createElement(blockquoteNode.nodeName);

                nextSiblingNodes.forEach(function (siblingNode) {
                  newContainerNode.appendChild(siblingNode);
                });

                blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
              }

              selection.placeMarkers();
              blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
              selection.selectMarkers();

              // If the BLOCKQUOTE is now empty, clean it up.
              if (blockquoteNode.innerHTML === '') {
                blockquoteNode.parentNode.removeChild(blockquoteNode);
              }
            } else {
              scribe.api.CommandPatch.prototype.execute.call(this);
            }
          }
        }.bind(this));
      };

      scribe.commandPatches.outdent = outdentCommand;
    };
  };

});

define('plugins/core/patches/commands/create-link',[],function () {

  

  return function () {
    return function (scribe) {
      var createLinkCommand = new scribe.api.CommandPatch('createLink');
      scribe.commandPatches.createLink = createLinkCommand;

      createLinkCommand.execute = function (value) {
        var selection = new scribe.api.Selection();

        /**
         * Firefox does not create a link when selection is collapsed
         * so we create it manually. http://jsbin.com/tutufi/2/edit?js,output
         */
        if (selection.selection.isCollapsed) {
          var aElement = document.createElement('a');
          aElement.setAttribute('href', value);
          aElement.textContent = value;

          selection.range.insertNode(aElement);

          // Select the created link
          var newRange = document.createRange();
          newRange.setStartBefore(aElement);
          newRange.setEndAfter(aElement);

          selection.selection.removeAllRanges();
          selection.selection.addRange(newRange);
        } else {
          scribe.api.CommandPatch.prototype.execute.call(this, value);
        }
      };
    };
  };

});

define('plugins/core/patches/events',['scribe-common/src/element'], function (element) {

  

  return function () {
    return function (scribe) {
      /**
       * Chrome: If a parent node has a CSS `line-height` when we apply the
       * insert(Un)OrderedList command, altering the paragraph structure by pressing
       * <backspace> or <delete> (merging/deleting paragraphs) sometimes
       * results in the application of a line-height attribute to the
       * contents of the paragraph, either onto existing elements or
       * by wrapping text in a span.
       * As per: http://jsbin.com/isIdoKA/4/edit?html,css,js,output
       *
       * FIXME: what if the user actually wants to use SPANs? This could
       * cause conflicts.
       */
      // TODO: do we need to run this on every key press, or could we
      //       detect when the issue may have occurred?
      // TODO: run in a transaction so as to record the change? how do
      //       we know in advance whether there will be a change though?
      // TODO: share somehow with `InsertList` command
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keyup', function (event) {
          if (event.keyCode === 8 || event.keyCode === 46) { // backspace or delete

            var selection = new scribe.api.Selection();

            // Note: the range is always collapsed on keyup here
            var containerPElement = selection.getContaining(function (node) {
              return node.nodeName === 'P';
            });
            if (containerPElement) {
              /**
               * The 'input' event listener has already triggered
               * and recorded the faulty content as an item in the
               * UndoManager.  We interfere with the undoManager
               * here to discard that history item, and let the next
               * transaction run produce a clean one instead.
               *
               * FIXME: ideally we would not trigger a
               * 'content-changed' event with faulty HTML at all, but
               * it's too late to cancel it at this stage (and it's
               * not happened yet at keydown time).
               */
              scribe.undoManager.undo();

              scribe.transactionManager.run(function () {
                // Store the caret position
                selection.placeMarkers();

                // We clone the childNodes into an Array so that it's
                // not affected by any manipulation below when we
                // iterate over it
                var pElementChildNodes = Array.prototype.slice.call(containerPElement.childNodes);
                pElementChildNodes.forEach(function(pElementChildNode) {
                  if (pElementChildNode.nodeName === 'SPAN') {
                    // Unwrap any SPAN that has been inserted
                    var spanElement = pElementChildNode;
                    element.unwrap(containerPElement, spanElement);
                  } else if (pElementChildNode.nodeType === Node.ELEMENT_NODE) {
                    /**
                     * If the paragraph contains inline elements such as
                     * A, B, or I, Chrome will also append an inline style for
                     * `line-height` on those elements, so we remove it here.
                     */
                    pElementChildNode.style.lineHeight = null;

                    // There probably wasn’t a `style` attribute before, so
                    // remove it if it is now empty.
                    if (pElementChildNode.getAttribute('style') === '') {
                      pElementChildNode.removeAttribute('style');
                    }
                  }
                });

                selection.selectMarkers();
              });
            }
          }
        });
      }
    };
  };
});

define('plugins/core/patches',[
  './patches/commands/bold',
  './patches/commands/indent',
  './patches/commands/insert-html',
  './patches/commands/insert-list',
  './patches/commands/outdent',
  './patches/commands/create-link',
  './patches/events'
], function (
  boldCommand,
  indentCommand,
  insertHTMLCommand,
  insertListCommands,
  outdentCommand,
  createLinkCommand,
  events
) {

  /**
   * Command patches browser inconsistencies. They do not perform core features
   * of the editor, such as ensuring P elements are created when
   * applying/unapplying commands — that is the job of the core commands.
   */

  

  return {
    commands: {
      bold: boldCommand,
      indent: indentCommand,
      insertHTML: insertHTMLCommand,
      insertList: insertListCommands,
      outdent: outdentCommand,
      createLink: createLinkCommand,
    },
    events: events
  };

});

define('plugins/core/set-root-p-element',[],function () {

  /**
   * Sets the default content of the scribe so that each carriage return creates
   * a P.
   */

  

  return function () {
    return function (scribe) {
      // The content might have already been set, in which case we don't want
      // to apply.
      if (scribe.getHTML().trim() === '') {
        /**
         * We have to begin with the following HTML, because otherwise some
         * browsers(?) will position the caret outside of the P when the scribe is
         * focused.
         */
        scribe.setContent('<p><br></p>');
      }
    };
  };

});

define('api/command-patch',[],function () {

  

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      scribe.transactionManager.run(function () {
        document.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      return document.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return document.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});

define('api/command',[],function () {

  

  return function (scribe) {
    function Command(commandName) {
      this.commandName = commandName;
      this.patch = scribe.commandPatches[this.commandName];
    }

    Command.prototype.execute = function (value) {
      if (this.patch) {
        this.patch.execute(value);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };

    Command.prototype.queryState = function () {
      if (this.patch) {
        return this.patch.queryState();
      } else {
        return document.queryCommandState(this.commandName);
      }
    };

    Command.prototype.queryEnabled = function () {
      if (this.patch) {
        return this.patch.queryEnabled();
      } else {
        return document.queryCommandEnabled(this.commandName);
      }
    };

    return Command;
  };

});

define('api/node',[],function () {

  

  function Node(node) {
    this.node = node;
  }

  // TODO: should the return value be wrapped in one of our APIs?
  // Node or Selection?
  // TODO: write tests. unit or integration?
  Node.prototype.getAncestor = function (nodeFilter) {
    var isTopContainerElement = function (element) {
      return element && element.attributes
        && element.attributes.getNamedItem('contenteditable');
    };
    // TODO: should this happen here?
    if (isTopContainerElement(this.node)) {
      return;
    }

    var currentNode = this.node.parentNode;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while (currentNode && ! isTopContainerElement(currentNode)) {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
  };

  Node.prototype.nextAll = function () {
    var all = [];
    var el = this.node.nextSibling;
    while (el) {
      all.push(el);
      el = el.nextSibling;
    }
    return all;
  };

  return Node;

});

define('api/selection',[],function () {

  

  return function (scribe) {
    function Selection() {
      this.selection = window.getSelection();

      if (this.selection.rangeCount) {
        this.range = this.selection.getRangeAt(0);
      }
    }

    Selection.prototype.getContaining = function (nodeFilter) {
      var node = new scribe.api.Node(this.range.commonAncestorContainer);
      var isTopContainerElement = node.node && node.node.attributes
         && node.node.attributes.getNamedItem('contenteditable');

      return ! isTopContainerElement && nodeFilter(node.node) ? node.node : node.getAncestor(nodeFilter);
    };

    Selection.prototype.placeMarkers = function () {
      var startMarker = document.createElement('em');
      startMarker.classList.add('scribe-marker');
      var endMarker = document.createElement('em');
      endMarker.classList.add('scribe-marker');

      // End marker
      var rangeEnd = this.range.cloneRange();
      rangeEnd.collapse(false);
      rangeEnd.insertNode(endMarker);

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
       * the inserted element. We just remove it. This in turn creates several
       * bugs when perfoming commands on selections that contain an empty text
       * node (`removeFormat`, `unlink`).
       * As per: http://jsbin.com/hajim/5/edit?js,console,output
       */
      // TODO: abstract into polyfill for `Range.insertNode`
      if (endMarker.nextSibling &&
          endMarker.nextSibling.nodeType === Node.TEXT_NODE
          && endMarker.nextSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.nextSibling);
      }



      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
       * the inserted element when the child element is at the start of a block
       * element. We just remove it.
       * FIXME: Document why we need to remove this
       * As per: http://jsbin.com/sifez/1/edit?js,console,output
       */
      if (endMarker.previousSibling &&
          endMarker.previousSibling.nodeType === Node.TEXT_NODE
          && endMarker.previousSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.previousSibling);
      }


      /**
       * This is meant to test Chrome inserting erroneous text blocks into
       * the scribe el when focus switches from a scribe.el to a button to
       * the scribe.el. However, this is impossible to simlulate correctly
       * in a test.
       *
       * This behaviour does not happen in Firefox.
       *
       * See http://jsbin.com/quhin/2/edit?js,output,console
       *
       * To reproduce the bug, follow the following steps:
       *    1. Select text and create H2
       *    2. Move cursor to front of text.
       *    3. Remove the H2 by clicking the button
       *    4. Observe that you are left with an empty H2
       *        after the element.
       *
       * The problem is caused by the Range being different, depending on
       * the position of the marker.
       *
       * Consider the following two scenarios.
       *
       * A)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click the right of to scribe.el
       *   3. scribe.el contains: ["1", <em>scribe-marker</em>. #text]
       *
       *   This is wrong but does not cause the problem.
       *
       * B)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click to left of scribe.el
       *   3. scribe.el contains: [#text, <em>scribe-marker</em>, "1"]
       *
       * The second example sets the range in the wrong place, meaning
       * that in the second case the formatBlock is executed on the wrong
       * element [the text node] leaving the empty H2 behind.
       **/


      if (! this.selection.isCollapsed) {
        // Start marker
        var rangeStart = this.range.cloneRange();
        rangeStart.collapse(true);
        rangeStart.insertNode(startMarker);

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
         * the inserted element. We just remove it. This in turn creates several
         * bugs when perfoming commands on selections that contain an empty text
         * node (`removeFormat`, `unlink`).
         * As per: http://jsbin.com/hajim/5/edit?js,console,output
         */
        // TODO: abstract into polyfill for `Range.insertNode`
        if (startMarker.nextSibling &&
            startMarker.nextSibling.nodeType === Node.TEXT_NODE
            && startMarker.nextSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.nextSibling);
        }

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node
         * before the inserted element when the child element is at the start of
         * a block element. We just remove it.
         * FIXME: Document why we need to remove this
         * As per: http://jsbin.com/sifez/1/edit?js,console,output
         */
        if (startMarker.previousSibling &&
            startMarker.previousSibling.nodeType === Node.TEXT_NODE
            && startMarker.previousSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.previousSibling);
        }
      }


      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      var markers = this.getMarkers();
      Array.prototype.forEach.call(markers, function (marker) {
        marker.parentNode.removeChild(marker);
      });
    };

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    Selection.prototype.selectMarkers = function (keepMarkers) {
      var markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      var newRange = document.createRange();

      newRange.setStartBefore(markers[0]);
      if (markers.length >= 2) {
        newRange.setEndAfter(markers[1]);
      } else {
        // We always reset the end marker because otherwise it will just
        // use the current range’s end marker.
        newRange.setEndAfter(markers[0]);
      }

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      // We must do `innerHTML.trim()` to avoid weird Firefox bug:
      // http://stackoverflow.com/questions/3676927/why-if-element-innerhtml-is-not-working-in-firefox
      if (containerPElement) {
        var containerPElementInnerHTML = containerPElement.innerHTML.trim();
        return (containerPElement.nodeName === 'P'
                && (containerPElementInnerHTML === '<br>'
                    || containerPElementInnerHTML === ''));
      } else {
        return false;
      }
    };

    return Selection;
  };

});

define('api/simple-command',[],function () {

  

  return function (api, scribe) {
    function SimpleCommand(commandName, nodeName) {
      scribe.api.Command.call(this, commandName);

      this.nodeName = nodeName;
    }

    SimpleCommand.prototype = Object.create(api.Command.prototype);
    SimpleCommand.prototype.constructor = SimpleCommand;

    SimpleCommand.prototype.queryState = function () {
      var selection = new scribe.api.Selection();
      return scribe.api.Command.prototype.queryState.call(this) && !! selection.getContaining(function (node) {
        return node.nodeName === this.nodeName;
      }.bind(this));
    };

    return SimpleCommand;
  };

});

define('api',[
  './api/command-patch',
  './api/command',
  './api/node',
  './api/selection',
  './api/simple-command'
], function (
  buildCommandPatch,
  buildCommand,
  Node,
  buildSelection,
  buildSimpleCommand
) {

  

  return function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/assign',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a callback is provided it will be executed to produce the
   * assigned values. The callback is bound to `thisArg` and invoked with two
   * arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
   * // => { 'name': 'fred', 'employer': 'slate' }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var object = { 'name': 'barney' };
   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var assign = function(object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    var args = arguments,
        argsIndex = 0,
        argsLength = typeof guard == 'number' ? 2 : args.length;
    if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
      var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
    } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
      callback = args[--argsLength];
    }
    while (++argsIndex < argsLength) {
      iterable = args[argsIndex];
      if (iterable && objectTypes[typeof iterable]) {
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
      }
      }
    }
    return result
  };

  return assign;
});

define('transaction-manager',['lodash-amd/modern/objects/assign'], function (assign) {

  

  return function (scribe) {
    function TransactionManager() {
      this.history = [];
    }

    assign(TransactionManager.prototype, {
      start: function () {
        this.history.push(1);
      },

      end: function () {
        this.history.pop();

        if (this.history.length === 0) {
          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      },

      run: function (transaction) {
        this.start();
        // If there is an error, don't prevent the transaction from ending.
        try {
          if (transaction) {
            transaction();
          }
        } finally {
          this.end();
        }
      }
    });

    return TransactionManager;
  };
});

define('undo-manager',[],function () {

  

  return function (scribe) {

    function UndoManager() {
      this.position = -1;
      this.stack = [];
      this.debug = scribe.isDebugModeEnabled();
    }

    UndoManager.prototype.maxStackSize = 100;

    UndoManager.prototype.push = function (item) {
      if (this.debug) {
        console.log('UndoManager.push: %s', item);
      }
      this.stack.length = ++this.position;
      this.stack.push(item);

      while (this.stack.length > this.maxStackSize) {
        this.stack.shift();
        --this.position;
      }
    };

    UndoManager.prototype.undo = function () {
      if (this.position > 0) {
        return this.stack[--this.position];
      }
    };

    UndoManager.prototype.redo = function () {
      if (this.position < (this.stack.length - 1)) {
        return this.stack[++this.position];
      }
    };

    return UndoManager;
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/pull',[], function() {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var splice = arrayRef.splice;

  /**
   * Removes all provided values from the given array using strict equality for
   * comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to modify.
   * @param {...*} [value] The values to remove.
   * @returns {Array} Returns `array`.
   * @example
   *
   * var array = [1, 2, 3, 1, 2, 3];
   * _.pull(array, 2, 3);
   * console.log(array);
   * // => [1, 1]
   */
  function pull(array) {
    var args = arguments,
        argsIndex = 0,
        argsLength = args.length,
        length = array ? array.length : 0;

    while (++argsIndex < argsLength) {
      var index = -1,
          value = args[argsIndex];
      while (++index < length) {
        if (array[index] === value) {
          splice.call(array, index--, 1);
          length--;
        }
      }
    }
    return array;
  }

  return pull;
});

define('event-emitter',['lodash-amd/modern/arrays/pull'], function (pull) {

  

  // TODO: once
  // TODO: unit test
  // Good example of a complete(?) implementation: https://github.com/Wolfy87/EventEmitter
  function EventEmitter() {
    this._listeners = {};
  }

  EventEmitter.prototype.on = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];

    listeners.push(fn);

    this._listeners[eventName] = listeners;
  };

  EventEmitter.prototype.off = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];
    if (fn) {
      pull(listeners, fn);
    } else {
      delete this._listeners[eventName];
    }
  };

  EventEmitter.prototype.trigger = function (eventName, args) {
    var listeners = this._listeners[eventName] || [];

    listeners.forEach(function (listener) {
      listener.apply(null, args);
    });
  };

  return EventEmitter;

});

define('scribe',[
  'lodash-amd/modern/objects/defaults',
  'lodash-amd/modern/arrays/flatten',
  './plugins/core/commands',
  './plugins/core/events',
  './plugins/core/formatters/html/replace-nbsp-chars',
  './plugins/core/formatters/html/enforce-p-elements',
  './plugins/core/formatters/html/ensure-selectable-containers',
  './plugins/core/formatters/plain-text/escape-html-characters',
  './plugins/core/inline-elements-mode',
  './plugins/core/patches',
  './plugins/core/set-root-p-element',
  './api',
  './transaction-manager',
  './undo-manager',
  './event-emitter'
], function (
  defaults,
  flatten,
  commands,
  events,
  replaceNbspCharsFormatter,
  enforcePElements,
  ensureSelectableContainers,
  escapeHtmlCharactersFormatter,
  inlineElementsMode,
  patches,
  setRootPElement,
  Api,
  buildTransactionManager,
  buildUndoManager,
  EventEmitter
) {

  

  function Scribe(el, options) {
    EventEmitter.call(this);

    this.el = el;
    this.commands = {};
    this.options = defaults(options || {}, {
      allowBlockElements: true,
      debug: false
    });
    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();

    this.api = new Api(this);

    var TransactionManager = buildTransactionManager(this);
    this.transactionManager = new TransactionManager();

    var UndoManager = buildUndoManager(this);
    this.undoManager = new UndoManager();

    this.el.setAttribute('contenteditable', true);

    this.el.addEventListener('input', function () {
      /**
       * This event triggers when either the user types something or a native
       * command is executed which causes the content to change (i.e.
       * `document.execCommand('bold')`). We can't wrap a transaction around
       * these actions, so instead we run the transaction in this event.
       */
      this.transactionManager.run();
    }.bind(this), false);

    /**
     * Core Plugins
     */

    if (this.allowsBlockElements()) {
      // Commands assume block elements are allowed, so all we have to do is
      // set the content.
      // TODO: replace this by initial formatter application?
      this.use(setRootPElement());
      // Warning: enforcePElements must come before ensureSelectableContainers
      this.use(enforcePElements());
      this.use(ensureSelectableContainers());
    } else {
      // Commands assume block elements are allowed, so we have to set the
      // content and override some UX.
      this.use(inlineElementsMode());
    }

    // Formatters
    this.use(escapeHtmlCharactersFormatter());
    this.use(replaceNbspCharsFormatter());


    // Patches
    this.use(patches.commands.bold());
    this.use(patches.commands.indent());
    this.use(patches.commands.insertHTML());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    this.use(patches.commands.createLink());
    this.use(patches.events());

    this.use(commands.indent());
    this.use(commands.insertList());
    this.use(commands.outdent());
    this.use(commands.redo());
    this.use(commands.subscript());
    this.use(commands.superscript());
    this.use(commands.undo());

    this.use(events());
  }

  Scribe.prototype = Object.create(EventEmitter.prototype);

  // For plugins
  // TODO: tap combinator?
  Scribe.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
  };

  Scribe.prototype.setHTML = function (html, skipFormatters) {
    if (skipFormatters) {
      this._skipFormatters = true;
    }
    this.el.innerHTML = html;
  };

  Scribe.prototype.getHTML = function () {
    return this.el.innerHTML;
  };

  Scribe.prototype.getContent = function () {
    // Remove bogus BR element for Firefox — see explanation in BR mode files.
    return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
  };

  Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
  };

  Scribe.prototype.pushHistory = function () {
    var previousUndoItem = this.undoManager.stack[this.undoManager.position];
    var previousContent = previousUndoItem && previousUndoItem
      .replace(/<em class="scribe-marker">/g, '').replace(/<\/em>/g, '');

    /**
     * Chrome and Firefox: If we did push to the history, this would break
     * browser magic around `Document.queryCommandState` (http://jsbin.com/eDOxacI/1/edit?js,console,output).
     * This happens when doing any DOM manipulation.
     */

    // We only want to push the history if the content actually changed.
    if (! previousUndoItem || (previousUndoItem && this.getContent() !== previousContent)) {
      var selection = new this.api.Selection();

      selection.placeMarkers();
      var html = this.getHTML();
      selection.removeMarkers();

      this.undoManager.push(html);

      return true;
    } else {
      return false;
    }
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem, true);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers();

    // Because we skip the formatters, a transaction is not run, so we have to
    // emit this event ourselves.
    this.trigger('content-changed');
  };

  // This will most likely be moved to another object eventually
  Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
  };

  Scribe.prototype.setContent = function (content) {
    if (! this.allowsBlockElements()) {
      // Set bogus BR element for Firefox — see explanation in BR mode files.
      content = content + '<br>';
    }

    this.setHTML(content);

    this.trigger('content-changed');
  };

  Scribe.prototype.insertPlainText = function (plainText) {
    this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
  };

  Scribe.prototype.insertHTML = function (html) {
    /**
     * When pasting text from Google Docs in both Chrome and Firefox,
     * the resulting text will be wrapped in a B tag. So it would look
     * something like <b><p>Text</p></b>, which is invalid HTML. The command
     * insertHTML will then attempt to fix this content by moving the B tag
     * inside the P. The result is: <p><b></b></p><p>Text</p>, which is valid
     * but means an extra P is inserted into the text. To avoid this we run the
     * formatters before the insertHTML command as the formatter will
     * unwrap the P and delete the B tag. It is acceptable to remove invalid
     * HTML as Scribe should only accept valid HTML.
     *
     * See http://jsbin.com/cayosada/3/edit for more
     **/

    // TODO: error if the selection is not within the Scribe instance? Or
    // focus the Scribe instance if it is not already focused?
    this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
  };

  Scribe.prototype.isDebugModeEnabled = function () {
    return this.options.debug;
  };

  Scribe.prototype.registerHTMLFormatter = function (phase, fn) {
    this._htmlFormatterFactory.formatters[phase].push(fn);
  };

  Scribe.prototype.registerPlainTextFormatter = function (fn) {
    this._plainTextFormatterFactory.formatters.push(fn);
  };

  // TODO: abstract
  function FormatterFactory() {
    this.formatters = [];
  }

  FormatterFactory.prototype.format = function (html) {
    // Map the object to an array: Array[Formatter]
    var formatted = this.formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  function HTMLFormatterFactory() {
    // Object[String,Array[Formatter]]
    // Define phases
    // For a list of formatters, see https://github.com/guardian/scribe/issues/126
    this.formatters = {
      // Configurable sanitization of the HTML, e.g. converting/filter/removing
      // elements
      sanitize: [],
      // Normalize content to ensure it is ready for interaction
      normalize: [],
      export: []
    };
  }

  HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
  HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;

  HTMLFormatterFactory.prototype.format = function (html) {
    // Flatten the phases
    // Map the object to an array: Array[Formatter]
    var formatters = flatten([this.formatters.sanitize, this.formatters.normalize]);
    var formatted = formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  HTMLFormatterFactory.prototype.formatForExport = function (html) {
    return this.formatters.export.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  return Scribe;

});

//# sourceMappingURL=scribe.js.map