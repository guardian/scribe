editor
======

## Patches
* `emptyEditorWhenDeleting`: This patch makes it impossible to delete the root
  P element. If this was allowed then the editor would begin to create DIV
  elements for each carriage return.
* `rootParagraphElement`: Sets the default content of the editor so that each
  carriage return creates a P.

## Plugins
* `sanitizer`: Adds the ability to sanitize content when it is pasted into the
  editor, adhering to a whitelist of allowed tags and attributes.
