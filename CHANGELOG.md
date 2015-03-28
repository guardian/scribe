# 1.3.4

Reverts the change to 3.5.0 as Bower and NPM-based packagers were not behaving consistently.

# 1.3.3

All plugins, formatters and commands can now be overridden via options.

Thanks [David Tobin](https://github.com/DavidTobin)

Lodash has been bumped to 3.5.0

# 1.3.2

Option handling (defaults and overrides) have now been moved to their own module

# 1.3.1

Adds a null check to selection.js to help with issues when Scribe is being run in ShadowDOM. Thanks [Shaun Netherby](https://github.com/shaunnetherby)

# 1.3.0

Introduces a new time-based undo manager and improvements to allow multiple Scribe instances to share or have a separate undo manager. Thanks to [Abdulrahman Alsaleh](https://github.com/aaalsaleh) for providing the code and spending a lot of time working with us on the tests.

# 1.2.11

Added configuration for removing `scribe.undoManager`

# 1.2.10

Bugfixes for selections that are 'reversed' (i.e. selected from right to left) from [Deains](https://github.com/deains). Thanks

# 1.2.9

Clarifies the use of nodeName in the Command implementation. Thanks [Christopher Liu](https://github.com/christopherliu)

# 1.2.8

Event waterfall / [Event Namespacing](https://github.com/guardian/scribe/pull/337)

# 1.2.7

ShadowDOM fixes for Chrome from [ShaunNetherby](https://github.com/shaunnetherby), thanks

# 1.2.5

IE11 compatiability changes from [Deains](https://github.com/deains), thank you

# 1.2.4

Changes the way that root nodes are detected, the code now uses the element that the Scribe instance is bound to rather than looking for contenteditable attributes.

# 1.2.3

Changes the EventEmitter to store callbacks in sets to enforce uniqueness and avoid duplicate calls

# 1.2.1

Fixes a typo with the use of options in the default command patches that was breaking Browserify

# 1.2.0

Allows the default command patches to be over-ridden in the options. This will allow users to customise what gets loaded to address issues like [the behaviour of the bold patch](https://github.com/guardian/scribe/pull/250) where the default behaviour is not what is required.

# 1.1.0

Introduces [ImmutableJS](https://github.com/facebook/immutable-js) (which is also exposed via scribe.immutable) and starts to convert some the internal workings of Scribe to use immutable data structures.

Adds 55K of needless bloat according to @theefer but I am heartless and laugh at his tears.

# 1.0.0

This is a non-backwards compatible change as we are removing the use of Scribe Common. The Node and Element apis that were available in that project are now exposed via the *scribe* object itself (`scribe.node` and `scribe.element`).

Existing plugins should not break for this release but please re-write your plugins if you use 1.0.0 as a dependency.

* Merge [Scribe Common into Scribe](https://github.com/guardian/scribe/pull/287)

# 0.1.26
* Add preliminary support for Safari 6. [Muration Observer Safari](https://github.com/guardian/scribe/pull/285)

# 0.1.25
* Switch from using export directly to the string alias version. [YUI Compressor changes](https://github.com/guardian/scribe/pull/279)

# 0.1.24
* Rework mandatory plugin loading [Plugin loading](https://github.com/guardian/scribe/pull/275)

# 0.1.23
* Fix Chrome 38 focus issue [Change check for ff](https://github.com/guardian/scribe/pull/265)

# 0.1.22
* Fix [Make Chrome set the correct focus as well](https://github.com/guardian/scribe/pull/262)

# 0.1.21
* Fix [Don't insert BR in empty non block elements](https://github.com/guardian/scribe/pull/258)

# 0.1.20
* Fix [Don't strip nbsps in the transaction manger](https://github.com/guardian/scribe/pull/257)

# 0.1.19
* Fix [Release v0.01.18 did not succeed](https://github.com/guardian/scribe/pull/253)

# 0.1.18
* Fix [New line detection improved](https://github.com/guardian/scribe/pull/253)

# 0.1.17
* Allow entering multiple consecutive spaces ([c4ba50eb](https://github.com/guardian/scribe/commit/c4ba50ebe457066f06daa5efe98e0a345658ac54) [#232](https://github.com/guardian/scribe/pull/232))

# 0.1.16
* Update [scribe-common includes to include src](https://github.com/guardian/scribe/pull/217)

# 0.1.15
* Fix [Remove erroneous block tags being left behind in Chrome](https://github.com/guardian/scribe/pull/223)

# 0.1.14
* Fix [Ensure selectable containers core plugin doesn't always work as desired](https://github.com/guardian/scribe/pull/214)

# 0.1.13
* Fix
  [insertHTML command wraps invalid B tags in a P, leaving empty Ps behind](https://github.com/guardian/scribe/pull/212)

# 0.1.12
* Fix [Text is lost when creating a list from P element containing BR elements](https://github.com/guardian/scribe/pull/195)

# 0.1.11
* Fix [`createLink` browser inconsistency](https://github.com/guardian/scribe/commit/4c8b536b3f029e51f54de43a6df9ce07bcf63f3e) ([#190](https://github.com/guardian/scribe/pull/190))
* Bug: Correct object reference ([517b22ab](https://github.com/guardian/scribe/commit/517b22ab88e5dfc231b10497e492a877e6a05668))

# 0.1.10
* Fix redo ([da9c3844](https://github.com/guardian/scribe/commit/da9c3844fc047bc3c0bce559a013ec7fdecfc0b1) [#133](https://github.com/guardian/scribe/pull/133))

# 0.1.9
* Use in-house `EventEmitter` ([5088eb14](https://github.com/guardian/scribe/commit/5088eb14de395cada7b9415b05ae3bb6d775b02a) [#128](https://github.com/guardian/scribe/pull/128))

# 0.1.7

* Prevent mutation observers from failing if an error occurs ([9c843e52](https://github.com/guardian/scribe/commit/9c843e52f7913cff9529ea0950acc0fbb78f7baa))

# 0.1.6

* Fix issue with breaking out of P mode in Firefox
  ([ddecae91](https://github.com/guardian/scribe/commit/ddecae91bc642f5e4344af6b51c84a4c85cbfe49)
   [#97](https://github.com/guardian/scribe/pull/97))

# 0.1.5

* Added `subscript` and `superscript` commands ([cba4ee23](https://github.com/guardian/scribe/commit/cba4ee2362387617bb83281ca23a9a9aa1c36862))
