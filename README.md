Scribe [![Build Status](https://travis-ci.org/guardian/scribe.svg?branch=master)](https://travis-ci.org/guardian/scribe)
======

[![Join the chat at https://gitter.im/guardian/scribe](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/guardian/scribe?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A rich text editor framework for the web platform, with patches for
browser inconsistencies and sensible defaults.

For an introduction, you may want to read the blog post [Inside the Guardian’s CMS: meet Scribe, an extensible rich text editor](http://www.theguardian.com/info/developer-blog/2014/mar/20/inside-the-guardians-cms-meet-scribe-an-extensible-rich-text-editor).

**Please note:** There is a lot of missing documentation for Scribe and many of
its plugins. We plan to improve this, however in the meantime we encourage
you to look at the code. Scribe is very small in comparison to other libraries
of its kind.

You can join us on IRC at [#scribejs] on freenode, or via the [Google Group](https://groups.google.com/forum/#!forum/scribe-editor).

[See an example][example].

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

Scribe overrides this behaviour to produce paragraphs (Ps; default) or BRs (with
block element mode turned off) for new lines instead.

## Installation
```
bower install scribe
```

Alternatively, you can [access the distribution files through GitHub releases](https://github.com/guardian/scribe/releases).

## Options

<dl>
  <dt><pre>allowBlockElements</pre></dt>
  <dd>Enable/disable block element mode (enabled by default)</dd>
  <dt><pre>defaultCommandPatches</pre></dt>
  <dd>Defines which command patches should be loaded by default</dd>
  <dt><pre>undo: { enabled: false }</pre></dt>
  <dd>Enable/disable Scribe's custom undo manager</dd>
</dl>

## Usage Example

Scribe is an AMD module:

``` js
require(['scribe', 'scribe-plugin-blockquote-command', 'scribe-plugin-toolbar'],
  function (Scribe, scribePluginBlockquoteCommand, scribePluginToolbar) {
  var scribeElement = document.querySelector('.scribe');
  // Create an instance of Scribe
  var scribe = new Scribe(scribeElement);

  // Use some plugins
  scribe.use(scribePluginBlockquoteCommand());
  var toolbarElement = document.querySelector('.toolbar');
  scribe.use(scribePluginToolbar(toolbarElement));
});
```

You can [see a live example here][example], or [view the code here](https://github.com/guardian/scribe/tree/gh-pages).

Also be sure to check the [`examples`](./examples) directory for an
AMD syntax example as well as a CommonJS (browserify) example.

## Architecture

* [Everything is a plugin](https://github.com/guardian/scribe/tree/master/src/plugins).
* No runtime dependencies.

A plugin is simply a function that receives Scribe as an argument:

``` js
function myPlugin(scribe) {}
```

A consumer can then use your plugin with `Scribe.use`:

``` js
scribe.use(myPlugin);
```

Plugins may package whatever functionality you desire, and you are free to use
native APIs to do so. However, you are required to wrap any DOM manipulation in
a transaction, so that we can capture state changes for the history. For
example:

``` js
function myPlugin(scribe) {
  scribe.transactionManager.run(function () {
    // Do some fancy DOM manipulation
  });
}
```

### Browser Support

Theoretically, Scribe should work in any browser with the
[Selection][Selection API] API, the [Range][Range API] API, and support for most
of the non-standardised list of commands that appears in
[this MDN article][Executing Commands]. It has been tested in Firefox >= 36,
Chrome >= 41.

See the [status of our integration tests](https://travis-ci.org/guardian/scribe)
for more up-to-date support information.


### Commands

Commands are objects that describe formatting operations. For example,
the bold command.

Commands tell Scribe:

* how to format some HTML when executed (similar to `document.queryCommand`);
* how to query for whether the given command has been executed on the current selection (similar to `document.queryCommandState`);
* how to query for whether the command can be executed on the document in its current state (similar to `document.queryCommandEnabled`)

To ensure a separation of concerns, commands are split into multiple layers.
When a command method is called by Scribe, it will be filtered through these
layers sequentially.

<dl>
  <dt>Scribe</dt>
  <dd>Where custom behaviour is defined.</dd>
  <dt>Scribe Patches</dt>
  <dd>Where patches for browser inconsistencies in native commands are defined.</dd>
  <dt>Native</dt>
</dl>

## Plugins

We have created a collection of plugins for advanced rich text editing purposes,
all of which can be seen in use in our [example][example].

* [scribe-plugin-blockquote-command](https://github.com/guardian/scribe-plugin-blockquote-command)
* [scribe-plugin-code-command](https://github.com/guardian/scribe-plugin-code-command)
* [scribe-plugin-curly-quotes](https://github.com/guardian/scribe-plugin-curly-quotes)
* [scribe-plugin-formatter-html-ensure-semantic-elements](https://github.com/guardian/scribe-plugin-formatter-html-ensure-semantic-elements)
* [scribe-plugin-formatter-plain-text-convert-new-lines-to-html](https://github.com/guardian/scribe-plugin-formatter-plain-text-convert-new-lines-to-html)
* [scribe-plugin-heading-command](https://github.com/guardian/scribe-plugin-heading-command)
* [scribe-plugin-inline-styles-to-elements](https://github.com/guardian/scribe-plugin-inline-styles-to-elements)
* [scribe-plugin-intelligent-unlink-command](https://github.com/guardian/scribe-plugin-intelligent-unlink-command)
* [scribe-plugin-keyboard-shortcuts](https://github.com/guardian/scribe-plugin-keyboard-shortcuts)
* [scribe-plugin-link-prompt-command](https://github.com/guardian/scribe-plugin-link-prompt-command)
* [scribe-plugin-noting](https://github.com/guardian/scribe-plugin-noting)
* [scribe-plugin-sanitizer](https://github.com/guardian/scribe-plugin-sanitizer)
* [scribe-plugin-smart-lists](https://github.com/guardian/scribe-plugin-smart-lists)
* [scribe-plugin-toolbar](https://github.com/guardian/scribe-plugin-toolbar)

## FAQ

### Is it production ready?

Yes. [The Guardian](http://gu.com) is using Scribe as the basis for their
internal CMS’ rich text editor.

It is likely that there will be unknown edge cases, but these will be addressed
when they are discovered.

### How do I run tests?

See [CONTRIBUTING.md](CONTRIBUTING.md) for information about running tests.

### Why does Scribe have a custom undo manager?

The [native API for formatting content in a
`contenteditable`][Executing Commands] has [many browser inconsistencies][browser inconsistencies].
Scribe has to manipulate the DOM directly on top of using these commands in order to patch
those inconsistencies. What’s more, there is no widely supported command for
telling `contenteditable` to insert Ps or BRs for line breaks. Thus, to add
this behaviour Scribe needs to manipulate the DOM once again.

The undo stack breaks whenever DOM manipulation is used instead of the native
command API, therefore we have to use our own.

Scribe's undo manager can be turned off by configuration eg:
``` js
var scribe = new Scribe(scribeElement, {
  undo: {
    enabled: false
  }
})
```

[browser inconsistencies]: https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md
[Executing Commands]: https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla#Executing_Commands
[Range API]: https://developer.mozilla.org/en-US/docs/Web/API/Range
[Selection API]: https://developer.mozilla.org/en-US/docs/Web/API/Selection
[example]: http://guardian.github.io/scribe
