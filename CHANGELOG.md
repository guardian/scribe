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
