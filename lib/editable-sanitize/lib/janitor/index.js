(function () {

  var janitor = {
    clean: function (html, config) {
      config = config || {};
      config.tags = config.tags || {};

      var sandbox = document.createElement('div');
      sandbox.innerHTML = html;

      var sanitize = function (parentNode) {
        for (var i = 0; i < parentNode.childNodes.length; i += 1) {
          var node = parentNode.childNodes[i],
              nodeName = node.nodeName.toLowerCase(),
              attrs = config.tags[nodeName];

          // Ignore text nodes and nodes that have already been sanitized
          if (node.nodeType === 3 || node._sanitized) {
            continue;
          }

          // Drop tag entirely
          if (!config.tags[nodeName]) {
            while (node.childNodes.length > 0) {
              parentNode.insertBefore(node.childNodes[0], node);
            }
            parentNode.removeChild(node);

            sanitize(parentNode);
            break;
          }

          // Sanitize attributes
          for (var a = 0; a < node.attributes.length; a += 1) {
            var attr = node.attributes[a],
                attrName = attr.name.toLowerCase();

            // Allow attribute?
            if (attrs.indexOf(attrName) === -1) {
              node.removeAttribute(node.attributes[a].name);
              // FIXME: Because we just shifted the array, our index is no longer calibrated.
              a = a - 1;
            }
          }

          // Sanitize children
          sanitize(node);

          // Mark node as sanitized so it's ignored in future runs
          node._sanitized = true;
        }
      };

      sanitize(sandbox);

      return sandbox.innerHTML;
    }
  };

  module.exports = janitor;

})();
