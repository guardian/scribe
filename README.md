editor
======

# Browser Inconsistencies
* "`insertHTML`": http://jsbin.com/elicInov/2/edit?html,js,output
* "`formatBlock`": http://jsbin.com/UTUDaPoC/1/edit?html,js,output
* "`bold`": http://jsbin.com/IxiSeYO/4/edit?html,js,output
* "`outdent`": http://jsbin.com/okAYaHa/1/edit?html,js,output
* "`indent`":
  - BLOCKQUOTE inside of P: http://jsbin.com/oDOriyU/1/edit?html,js,output
  - ULs: http://jsbin.com/ORikUPa/1/edit?html,js,output

## Patches
* `emptyEditorWhenDeleting`: This patch makes it impossible to delete the root
  P element. If this was allowed then the editor would begin to create DIV
  elements for each carriage return.
* `rootParagraphElement`: Sets the default content of the editor so that each
  carriage return creates a P.

## Plugins
* `blockquoteCommand`: Adds a command for blockquotes.
* `headingCommand`: Adds a command for headings.
* `linkPromptCommand`: Adds a command for creating links, including a basic prompt.
* `sanitizer`: Adds the ability to sanitize content when it is pasted into the
  editor, adhering to a whitelist of allowed tags and attributes.
