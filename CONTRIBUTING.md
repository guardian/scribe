# Contributing

* Add a failing test
* Create isolated cases for browser inconsistencies (see https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md)
* No assumptions should be made in the code – comment every little detail with
  references to isolated cases (when dealing with browser inconsistencies)

## Testing Locally
```
./setup.sh
node test/server
BROWSER_NAME='chrome' node test/runner.js
```

## Testing via Sauce Labs
You will need to [download Sauce Connect](https://saucelabs.com/docs/connect).

TODO: Add steps for downloading Sauce Connect, i.e. https://github.com/angular/angular.js/blob/master/lib/sauce/sauce_connect_setup.sh
```
./setup.sh
node test/server
export SAUCE_USERNAME='scribe-ci' SAUCE_ACCESS_KEY='4be9eeed-61de-4948-b18d-f7f655e9e4b0'

# Sauce Connect v3
java -jar ~/Downloads/Sauce-Connect-latest/Sauce-Connect.jar $SAUCE_USERNAME $SAUCE_ACCESS_KEY
# Sauce Connect v4
~/Downloads/sc-4.1-osx/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY

RUN_IN_SAUCE_LABS=true BROWSER_NAME='chrome' BROWSER_VERSION='32' PLATFORM='WINDOWS' npm test
```

## Releasing
TODO: Add a script to do this for you

* Run `plumber build`
* Checkout the `dist` branch
* Bump version number in Bower manifest
* Copy the distribution files from Plumber into the index
* Commit using version number as the message – also add `[ci skip]` (temporary
  Travis workaround: https://github.com/travis-ci/travis-ci/issues/1468)
* `git tag v<version number>`
* `git push --set-upstream origin dist <tag name>`
* Update change log in `master` branch
* `git checkout gh-pages`
* `git pull`
* Update versions of `bower.json`
* `bower install`
* `bower prune`
* `git add --update .`
* Commit using version number as the message (OR plugin version)

## Conventions
* In documentation and code, refer to nodes by their canonical node name in
  uppercase. E.g. `P`.
* When creating variables that refer to nodes or elements, suffix them with
  `node` or `element` respectively. E.g. `pElement` or `textNode`.

## Tools
* Paste bin: http://jsfiddle.net/OliverJAsh/z8FTb/
