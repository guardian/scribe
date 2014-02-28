Scribe
======

An underlying layer for composing a custom rich text editor, with patches for
browser inconsistencies and sensible defaults.

## Core

At the core of Scribe we have:

* [Patches for many browser inconsistencies surrounding `contenteditable`](#patches);
* [Inline and block element modes](#modes).

### Patches

Scribe patches [many browser inconsistencies][browser inconsistencies] in the
[native command API][Executing Commands].

### Modes

Natively, `contenteditable` will produce DIVs for new lines. This is not a bug.
However, this is not ideal because in most cases we require semantic HTML to be
produced.

Scribe overrides this behaviour to produce paragraphs (Ps; default) or BRs for
new lines instead.

## Plugins

TODO

## Installation
```
bower install scribe
```

## Options

<dl>
  <dt>`allowBlockElements`</dt>
  <dd>Enable or disable block element mode (enabled by default)</dd>
</dl>

## API

TODO

## Example

``` js
var scribeElement = document.querySelector('.scribe');
// Create an instance of Scribe
var scribe = new Scribe(scribeElement);

// Use some plugins
scribe.use(scribePluginBlockquoteCommand());
var toolbarElement = document.querySelector('.toolbar');
scribe.use(scribePluginToolbar(toolbarElement));
```

## Architecture

[Everything is a plugin.](https://github.com/guardian/scribe/tree/master/src/plugins)

### Browser Support

Theoretically, Scribe should work in any browser with the
[Selection][Selection API] API, the [Range][Range API] API, and support for most
of the non-standardised list of commands that appears in
[this MDN article][Executing Commands]. It has been tested in Firefox >= 19,
Chrome >= 21, and Safari 7.

We have a [suite of integration tests](https://github.com/guardian/scribe/tree/master/test)
in this repository that will eventually run in the cloud, providing clear
visibility of browser support.

### Commands

Commands are objects that describe command formatting operations. For example,
the bold command.

Commands tell Scribe:

* how to format some HTML when executed (similar to `document.queryCommand`);
* how to query for whether the given command has been executed on the current selection (similar to `document.queryCommandState`);
* how to query for whether the command can be executed on the document in its current state (similar to `document.queryCommandEnabled`)

To ensure a separation of concerns, commands are split into multiple layers.

<dl>
  <dt>Scribe</dt>
  <dd>Where custom behaviour is defined.</dd>
  <dt>Scribe Patches</dt>
  <dd>Where patches for brower inconsistencies in native commands are defined.</dd>
  <dt>Native</dt>
</dl>

When a command method is called by Scribe, it will be filtered through these
layers sequentially.

## FAQ

### Is it production ready?

It is likely that there will be unknown edge cases, but these will be addressed
when they are discovered.

In the meantime, you can take some assurance from the fact that The Guardian is
using Scribe to compose the rich text editor for its internal CMS.

### Why does Scribe have a custom undo manager?

The [native API for formatting content in a
`contenteditable`][Executing Commands] has [many browser inconsistencies][browser inconsistencies].
Scribe has to manipulate the DOM directly on top of using these commands in order to patch
those inconsistencies. What’s more, there is no widely supported command for
telling `contenteditable` to insert Ps or BRs for line breaks. Thus, to add
this behaviour Scribe needs to manipulate the DOM once again.

The undo stack breaks whenever DOM manipulation is used instead of the native
command API, therefore we have to use our own.

[browser inconsistencies]: https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md
[Executing Commands]: https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla#Executing_Commands
[Range API]: https://developer.mozilla.org/en-US/docs/Web/API/Range
[Selection API]: https://developer.mozilla.org/en-US/docs/Web/API/Selection
