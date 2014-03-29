var amdclean = {};
amdclean['scribe_plugin_intelligent_unlink_command'] = function () {
    return function (scribe) {
        var unlinkCommand = new scribe.api.Command('unlink');
        unlinkCommand.execute = function () {
            var selection = new scribe.api.Selection();
            if (selection.selection.isCollapsed) {
                scribe.transactionManager.run(function () {
                    /**
                     * If the selection is collapsed, we can remove the containing anchor.
                     */
                    var aNode = selection.getContaining(function (node) {
                            return node.nodeName === 'A';
                        });
                    if (aNode) {
                        new scribe.api.Element(aNode.parentNode).unwrap(aNode);
                    }
                }.bind(this));
            } else {
                scribe.api.Command.prototype.execute.apply(this, arguments);
            }
        };
        unlinkCommand.queryEnabled = function () {
            var selection = new scribe.api.Selection();
            if (selection.selection.isCollapsed) {
                return !!selection.getContaining(function (node) {
                    return node.nodeName === 'A';
                });
            } else {
                return scribe.api.Command.prototype.queryEnabled.apply(this, arguments);
            }
        };
        scribe.commands.unlink = unlinkCommand;
    };
};
var __lastValue = function (obj) {
    var last;
    for (var key in obj) {
        last = obj[key];
    }
    return last;
};
module.exports = amdclean.hasOwnProperty('undefined') ? amdclean['undefined'] : __lastValue(amdclean);