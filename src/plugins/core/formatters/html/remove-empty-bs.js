define([
], function () {


    /*
     * This is not currently being used in Scribe and is not
     * complete. It offers a recursive solution to checking
     * a given node is empty. It may come in used at some
     * point.
     */
    return function (scribe) {
        scribe.registerHTMLFormatter('sanitize', function () {
            var bs = scribe.el.querySelectorAll('b');

            var checkChildren = function (value) {
                if(value && value.childNodes.length === 0) {
                    return true;
                } else if(value.innerHTML) {
                    return false;
                }

                return checkChildren(value.childNodes[0]);
            };

            Array.prototype.filter.call(bs, function (value) {
                return checkChildren(value); //value.childNodes.length === 0; //|| value.match(/^[\s ]*$/);
            }).forEach(function (element) { element.remove(); });

            return scribe.el.innerHTML;
        });
    };
});
