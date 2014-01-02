Scribe
======

## List of `contenteditable` Browser Inconsistencies
Playground: http://jsbin.com/iwEWUXo/2/edit?js,console,output
* "`insertBrOnReturn`": http://jsbin.com/IQUraXA/1/edit?html,js,output
* "`insertHTML`": http://jsbin.com/elicInov/2/edit?html,js,output
* "`formatBlock`": http://jsbin.com/UTUDaPoC/1/edit?html,js,output
* "`bold`": http://jsbin.com/IxiSeYO/4/edit?html,js,output
* "`outdent`":
  - Chrome removes BLOCKQUOTE content formatting: http://jsbin.com/okAYaHa/1/edit?html,js,output
  - Chrome removes collapsed selection formatting: http://jsbin.com/IfaRaFO/1/edit?html,js,output
* "`insertOrderedList`/`insertOrderedList`":
  - Chrome nests list inside of P: http://jsbin.com/eFiRedUc/1/edit?html,js,output
  - Chrome removes SPAN: http://jsbin.com/abOLUNU/1/edit?html,js,output
  - Chrome appends span to LIs with inline styling for `line-height`: http://jsbin.com/OtemujAY/3/edit
* "`indent`":
  - Chrome nests BLOCKQUOTE inside of P: http://jsbin.com/oDOriyU/3/edit?html,js,output
  - Chrome nests ULs inside of ULs: http://jsbin.com/ORikUPa/3/edit?html,js,output
  - Chrome adds redundant `style` attribute: http://jsbin.com/AkasOzu/1/edit?html,js,output
