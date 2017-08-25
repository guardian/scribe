# 4.0.0

- Builds using [webpack](https://webpack.js.org/)
- Switches to [npm](https://npmjs.com)-only dependency management and publishing, removing [bower](https://bower.io/) support.
- Updates dependencies

These changes are the first in a wide-ranging modernisation process that scribe will be going through.

# 3.3.0

Merges a range of bug fixes including removing the dependency on lodash, use of ES6 `const` not inserting `<br>` tags into custom elements and a sanity check to ensure a `listElement` exists before inserting a list.

Thank you [Dan Burzo](https://github.com/danburzo), [James Lawson](https://github.com/jameslawson), [code-smith](https://github.com/code-smith), [Nazar Mokrynskyi](https://github.com/nazar-pc), [Rob Rees](https://github.com/rrees) and [Oliver J Ash](https://github.com/OliverJAsh) for contributing to these fixes.

We hope to move towards more granular releases from now on.

# 3.2.0

This changes the key bindings for undo and redo so that they are more specific and should no longer capture the key sequence for certain Polish letters. See #448 for details.

Thank you [Dan Burzo](https://github.com/danburzo) for contributing this fix.

# 3.1.0

Updates the version of Immutable Scribe uses to 3.8.x.

# 3.0.0

Replaces the last Lodash call with `Object.assign`. This was already available in the browsers Scribe is targeted at but in addition the build process has been changed to use later versions of Node.

# 2.3.0

Introduces a destroy event that plugins can use to clean up after themselves.

This re-implements an initial implementation by [Craig Speath](https://github.com/craigspaeth), thanks for the contribution.

# 2.2.5

Switches the events from literal strings to using identities from an events module.

# 2.2.4

Attempts to simplify the code in the `inline-elements-mode` plugin as per the suggestions from [Rasmus Schultz](https://github.com/mindplay-dk).

This change also covers the code with a unit test in case it needs to be modified in future.

# 2.2.3

Removes unneeded paramters from calls to `setStartAfter` and `setEndAfter`.

Thanks to [Rasmus Schultz](https://github.com/mindplay-dk) for reporting the issue.

# 2.2.2

Removes the observable check function introduced in 2.1.0. As this was not exported I'm treating it as a non-breaking change.

# 2.2.1

Corrects a small style issue where one of the tests was relying on the default coercion of the empty string to the false boolean. The test is now explicit.

# 2.2.0

Addresses issue #456 where one of the core plugins (enforce-p-elements) would wrap empty text nodes in paragraph elements. This behaviour was hidden by the use of the HTML Sanitizer.

Text nodes consisting just of whitespace are not changed now when the plugin runs.

Thanks to [Rasmus Schultz](https://github.com/mindplay-dk) for reporting the issue.

# 2.1.2

Fixes an issue where the undo manager could not be disabled due to an unconditional execution of the manager code in the setHTML method (issue #452).

# 2.1.1

Fixes an issue where the window global was still being referenced so the module still couldn't be used server-side.

# 2.1.0

Changes the way the mutation observer is determined and changes the way that nodes with certain classes are checked for. Both of these changes are aimed at offerring better support for server-side rendering.

Thank you [Sergey Zyablitsky](https://github.com/szyablitsky) and [Simon Degraeve](https://github.com/SimonDegraeve) for your contributions towards this goal.

# 2.0.2

Adds a workaround to allow paste events to work on Android. Thanks to [crasu](https://github.com/crasu) for the contribution.

# 2.0.1

The code for handling manual navigation in list elements now passes the event to its associated command for plugins to use in their response.

Thank you to [Josh Moore](https://github.com/josh-infusionsoft) for contributing this change. Please raise issues on how you think this should work generally if you are interested.

# 2.0.0

A split text node will [no longer be replaced by a non-breaking backspace](https://github.com/guardian/scribe/pull/421) but instead should be a regular space character.

Thanks [Jeffrey Wear](https://github.com/wearhere) for this change/fix

# 1.4.15

Stripping of Chrome artifacts has been consolidated into a single function. Thanks [Regis Kuckaertz](https://github.com/regiskuckaertz)

# 1.4.14

The undo manager has been re-written to use Immutable data structures. Thanks [Regis Kuckaertz](https://github.com/regiskuckaertz)

# 1.4.13

A more elegant fix for [#401](https://github.com/guardian/scribe/issues/401) from [Alexy Golev](https://github.com/alexeygolev), thanks!

# 1.4.12

Restores `scribe.element` (lost in release 1.4.9) to avoid breaking backwards compatibility

# 1.4.11

Another attempt to fix [#401](https://github.com/guardian/scribe/issues/401), this time using Immutable data and Array.prototype.slice.

# 1.4.10

The `NS_ERROR_UNEXPECTED` is now caught and supressed. This exeception is being [thrown by Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=562623) and seems to be a browser specific bug to do with element focus. This change just avoids lots of supurious errors being thrown.

We should remove it once the bug has been fixed.

# 1.4.9

Consolidates a number of api operations into the node module.

Restructing by [Regis Kuckaertz](https://github.com/regiskuckaertz)

# 1.4.8

Short-circuits the mutation evaluation via use of Array.prototype.some

[Regis Kuckaertz](https://github.com/regiskuckaertz)

# 1.4.7

Not a valid build, issues between Bower and NPM

# 1.4.6

Treat the clipboard data types variable as an array to avoid issues with future releases of Chrome (and other browsers). Resolves [#401](https://github.com/guardian/scribe/issues/401).

# 1.4.5

Corrects the NPM version of the ImmutableJS dependency

# 1.4.4

Replaces some of the use of Lodash contains with Immutable data structures and `includes`.

# 1.4.3

Changes the require alias so that the Immutable import path is simplified.

# 1.4.2

A number of performance improvements have been contributed by [Regis Kuckaertz](https://github.com/regiskuckaertz). Primarily these include avoiding TreeWalker where it isn't needed and moving a number of function definitions to the parse phase. See the individual PRs for details.

# 1.4.1

Small optimisation to avoid a relayout as a result of placing Scribe markers.

Thanks for improvement [Brad Vogel](https://github.com/bradvogel)

# 1.4.0

Changes the cleanup for Chrome inline style tags that happens in the patch for the `insertHTML` command. Previously span tags were aggressively stripped whereas now they are less aggressively removed to limit the fix just to the type of spans that Chrome inserts.

Thanks [Christopher Liu](https://github.com/christopherliu) for contributing this change.

# 1.3.9

Stops Scribe failing on a focus event if the content of the Scribe element is set to empty. Previously the code assumed that a child node is available, now the focus node will be the parent element if there are no children.

Based on contributions from [Ryan Fitzgerald](https://github.com/rf-)

# 1.3.7

Fixes a bug where em tags were being stripped where we meant to strip Scribe markers instead.

Thanks [Abdulrahman Alsaleh](https://github.com/aaalsaleh) for the fix

# 1.3.6

Fixes a bug preventing individual events being switched off events in the event-emitter
Bumps Lodash to 3.5.0 in the NPM package description for those using CommonJS builds

Thanks [Ryan Fitzgerald](https://github.com/rf-)!

# 1.3.5

Fixes `event-emitter` off behaviour when un-binding events

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
