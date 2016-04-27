
# Decisions log

## 2016-04-27 Node 5 compatibility

In the long term we want to move this codebase from AMD modules to ES6 modules. To get the whole codebase to build on later versions of Node I removed a number of the dev dependendencies that were not compatible beyond Node 0.10.

Since a lot of these were related to the functional testing suite this means someone will have to do a lot more work to get these running again in the future if they want them. Sorry.

By relying on ES2015 features I also think we can remove our dependency on Lodash in core Scribe now.

The use of `Object.assign` means a major release version as this may not be backwards compatible with some browser versions that we used to support.

## 2016-04-16 Event namespacing

Events in Scribe are generally only propogated within the Scribe instance so we haven't namespaced them before. However within the Guardian products that Scribe is used we do tend to namespace all events as we have had problems with event clashes between browser extensions/add-ons and third-party code.

Therefore without removing the current legacy `content-changed` event, which would cause too much grief in the plugin ecosystem, event names in Scribe will now be prefixed with "scribe".
