# Contributing

* Add a failing test
* Create isolated cases for browser inconsistencies (see https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md)
* No assumptions should be made in the code – comment every little detail with
  references to isolated cases (when dealing with browser inconsistencies)

## Releasing
TODO: Add a script to do this for you

* Run `plumber build`
* Checkout the `dist` branch
* Bump version number in Bower manifest
* Copy the distribution files from Plumber into the index
* Commit using version number as the message – also add `[ci skip]` (temporary
  Travis workaround: https://github.com/travis-ci/travis-ci/issues/1468)
* `git tag v<version number>`
* `git push origin dist <tag name>`
* Update change log in `master` branch

## Conventions
* In documentation and code, refer to nodes by their canonical node name in
  uppercase. E.g. `P`.
* When creating variables that refer to nodes or elements, suffix them with
  `node` or `element` respectively. E.g. `pElement` or `textNode`.
