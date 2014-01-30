Scribe
======

## List of `contenteditable` Browser Inconsistencies
Playground: http://jsbin.com/iwEWUXo/2/edit?js,console,output

### `document.execCommand` commands
* Firefox: When the `contenteditable` element is a custom element, an error is
  thrown when trying to apply one of the following commands.
  As per: http://jsbin.com/etepiPOn/1/edit?html,css,js,console,output
  `insertOrderedList`, insertUnorderedList`, `indent`, `outdent`, `formatBlock`
* "`insertBrOnReturn`": http://jsbin.com/IQUraXA/1/edit?html,js,output
* "`insertHTML`":
  - http://jsbin.com/elicInov/2/edit?html,js,output
  - Chrome applies styling to invalid markup, Firefox allows invalid markup: http://jsbin.com/ObiBoweG/1/edit?js,console,output
* "`formatBlock`": http://jsbin.com/UTUDaPoC/1/edit?html,js,output
* "`bold`": http://jsbin.com/IxiSeYO/4/edit?html,js,output
* "`outdent`":
  - Chrome removes BLOCKQUOTE content formatting: http://jsbin.com/okAYaHa/1/edit?html,js,output
  - Chrome removes collapsed selection formatting: http://jsbin.com/IfaRaFO/1/edit?html,js,output
* "`insertOrderedList`"/"`insertOrderedList`":
  - Chrome nests list inside of block elements: http://jsbin.com/eFiRedUc/1/edit?html,js,output
  - Chrome removes SPAN: http://jsbin.com/abOLUNU/1/edit?html,js,output
  - Chrome appends SPAN to LIs with inline styling for `line-height`: http://jsbin.com/OtemujAY/10/edit?html,css,js,output
* "`indent`":
  - Chrome nests BLOCKQUOTE inside of P: http://jsbin.com/oDOriyU/3/edit?html,js,output
  - Chrome nests ULs inside of ULs: http://jsbin.com/ORikUPa/3/edit?html,js,output
  - Chrome adds redundant `style` attribute: http://jsbin.com/AkasOzu/1/edit?html,js,output

### `Range.insertNode`
* Chrome inserts a bogus text node: http://jsbin.com/ODapifEb/1/edit?js,console,output
  - This in turn creates several bugs when perfoming commands on selections
    that contain an empty text node (`removeFormat`, `unlink`)

### `Document.queryCommandState`
* Browser magic: Chrome and Firefox report command state to be true after
  applying a command to a collapsed selection, but why?: http://jsbin.com/eDOxacI/1/edit?js,console,output

### `Element.focus`
* Firefox: Giving focus to a `contenteditable` will place the caret outside of
  any block elements. Chrome behaves correctly by placing the caret at the
  earliest point possible inside the first block element: http://jsbin.com/eLoFOku/1/edit?js,console,output
