# Contributing

## Releasing
TODO: Add a script to do this for you

* Bump version number in Bower manifest
* Commit using version number as the message – also add "[ci skip]" (temporary
  Travis workaround: https://github.com/travis-ci/travis-ci/issues/1468)
* Add tag in the form of "v<version number>"
* Push with tags

## Conventions
* In documentation and code, refer to nodes by their canonical node name in
  uppercase. E.g. `P`.
* When creating variables that refer to nodes or elements, suffix them with
  `node` or `element` respectively. E.g. `pElement` or `textNode`.
