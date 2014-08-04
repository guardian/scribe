# Contributing

These steps also apply to plugins.

* Add a failing test
* Create isolated cases for browser inconsistencies (see https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md)
* No assumptions should be made in the code – comment every little detail with
  references to isolated cases (when dealing with browser inconsistencies)

## Testing Locally
```
# Mac only
brew install chromedriver
```

```
./setup.sh
# Defaults: TEST_SERVER_PORT=8080
TEST_SERVER_PORT=8080 \
BROWSER_NAME='chrome' \
npm test
```

## Testing via Sauce Labs
You will need to [download Sauce Connect](https://saucelabs.com/docs/connect).

TODO: Add steps for downloading Sauce Connect, i.e. https://github.com/angular/angular.js/blob/master/lib/sauce/sauce_connect_setup.sh
```
./setup.sh
export SAUCE_USERNAME='scribe-ci' SAUCE_ACCESS_KEY='4be9eeed-61de-4948-b18d-f7f655e9e4b0'

# Sauce Connect v3
java -jar ~/Downloads/Sauce-Connect-latest/Sauce-Connect.jar $SAUCE_USERNAME $SAUCE_ACCESS_KEY
# Sauce Connect v4
~/Downloads/sc-4.1-osx/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY

# Defaults: TEST_SERVER_PORT=8080
TEST_SERVER_PORT=8080 \
RUN_IN_SAUCE_LABS=true \
BROWSER_NAME='chrome' \
BROWSER_VERSION='32' \
PLATFORM='WINDOWS' \
npm test
```

## Releasing

### Bower
* `git checkout master`
* Run `./release-bower.sh [ <newversion> | major | minor | patch | build ]` (we use
  [mversion](https://github.com/mikaelbr/mversion#usage-cli)). (If releasing a
  plugin, run the script inside this repository from the plugin’s directory.)
* Checkout the `dist` branch to check you're happy with the compilation result.
  If you are, run `git push; git push --tags`. (The `dist` tree is for
  distribution via Bower).

### npm
* Update `CHANGELOG.md`
* Run `./release-npm.sh <newversion>`

### Update example
* `git checkout gh-pages`
* `git pull`
* Update necessary dependency versions in `bower.json`. Check `bower ls` to see
  which components need updating.
* `bower install`
* `bower prune`
* `git add --update .` (don't include untracked files from source Bower
  components)
* Commit using version number as the message (OR plugin version)
* `git push`

## Conventions
* In documentation and code, refer to nodes by their canonical node name in
  uppercase. E.g. `P`.
* When creating variables that refer to nodes or elements, suffix them with
  `node` or `element` respectively. E.g. `pElement` or `textNode`.

## Tools
* Paste bin: http://jsfiddle.net/OliverJAsh/z8FTb/
