
# Decisions log

## 2016-04-16 Event namespacing

Events in Scribe are generally only propogated within the Scribe instance so we haven't namespaced them before. However within the Guardian products that Scribe is used we do tend to namespace all events as we have had problems with event clashes between browser extensions/add-ons and third-party code.

Therefore without removing the current legacy `content-changed` event, which would cause too much grief in the plugin ecosystem, event names in Scribe will now be prefixed with "scribe".
