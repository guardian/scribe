# Scribe

A rich text editor framework for the web platform, with patches for
browser inconsistencies and sensible defaults.

## Status

 [![Build Status](https://travis-ci.org/guardian/scribe.svg?branch=master)](https://travis-ci.org/guardian/scribe) <a href="https://david-dm.org/guardian/scribe"><img src="https://david-dm.org/guardian/scribe.svg"></a> [![Join the chat at https://gitter.im/guardian/scribe](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/guardian/scribe?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Description

For an introduction, you may want to read the blog post [Inside the Guardian’s CMS: meet Scribe, an extensible rich text editor](http://www.theguardian.com/info/developer-blog/2014/mar/20/inside-the-guardians-cms-meet-scribe-an-extensible-rich-text-editor).

**Please note:** There is a lot of missing documentation for Scribe and many of its plugins. We plan to improve this, however in the meantime we encourage you to look at the code. Scribe is very small in comparison to other libraries of its kind.

You can join us on IRC at [#scribejs] on freenode, or via the [Google Group](https://groups.google.com/forum/#!forum/scribe-editor).

[See an example][example].

Scribe only actively supports a [sub-set of browsers](https://github.com/guardian/scribe/wiki/Browser-support).

## Core

At the core of Scribe we have:

* [Patches for many browser inconsistencies surrounding `contenteditable`](#patches);
* [Inline and block element modes](https://github.com/guardian/scribe/wiki/Modes#).

### Patches

Scribe patches [many browser inconsistencies][browser inconsistencies] in the [native command API][Executing Commands].

## Installation
```
bower install scribe
```

Alternatively, you can [access the distribution files through GitHub releases](https://github.com/guardian/scribe/releases).

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

You can [see a live example here][example], or [view the code here](https://github.com/guardian/scribe).

Also be sure to check the [`examples`](./examples) directory for an
AMD syntax example as well as a CommonJS (browserify) example.

## Options

<dl>
  <dt><pre>allowBlockElements</pre></dt>
  <dd>Enable/disable block element <a href="https://github.com/guardian/scribe/wiki/Modes">mode</a> (enabled by default)</dd>
  <dt><pre>undo: { enabled: false }</pre></dt>
  <dd>Enable/disable Scribe's custom undo manager</dd>
  <dt><pre>defaultCommandPatches</pre></dt>
  <dd>Defines which command patches should be loaded by default</dd>
  <dt><pre>defaultPlugins</pre></dt>
  <dd>Defines which of Scribe's built-in plugins should be active</dd>
  <dt><pre>defaultFormatters</pre></dt>
  <dd>Defines which of Scribe's default formatters should be active</dd>
</dl>

For detailed documentation see the [wiki page on options](https://github.com/guardian/scribe/wiki/Scribe-configuration-options).

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

[Moved to the Github Wiki](https://github.com/guardian/scribe/wiki/Browser-support)

## Plugins

Scribe has a rich plugin ecosystem that expands and customises what it can do.

See the wiki for a [list of plugins and how to create new ones](https://github.com/guardian/scribe/wiki/Plugins)

## FAQ

See the wiki's [FAQ](https://github.com/guardian/scribe/wiki/FAQ)

[browser inconsistencies]: https://github.com/guardian/scribe/blob/master/BROWSERINCONSISTENCIES.md
[Executing Commands]: https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla#Executing_Commands
[Range API]: https://developer.mozilla.org/en-US/docs/Web/API/Range
[Selection API]: https://developer.mozilla.org/en-US/docs/Web/API/Selection
[example]: http://guardian.github.io/scribe
