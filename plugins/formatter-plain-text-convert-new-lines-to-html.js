var amdclean = {};
amdclean['scribe_plugin_formatter_plain_text_convert_new_lines_to_html'] = function () {
    return function (scribe) {
        scribe.plainTextFormatter.formatters.push(function (html) {
            return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
        });
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