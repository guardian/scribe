(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.scribePluginContentCleaner = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = function (scribe) {
    "use strict";

    var COMMAND_NAME = "cleanup";

    var filters = [function (text) {
        return text.replace(/(&nbsp;)/gi, " ");
    }, function (text) {
        return text.replace(/\s+/g, " ");
    }, function (text) {
        return text.replace(/ -- /g, " &ndash; ");
    }, function (text) {
        return text.replace(/ - /g, " &ndash; ");
    }, function (text) {
        return text.replace(/(<br\s*\/?>){3,}/gi, "<br>");
    }, function (text) {
        return text.replace(/<p>\s*?<br\s*\/?><\/p>/g, "");
    }, function (text) {
        return text.replace(/(\w)\s*--\s*(\w(?!(ote\b|tart\b|nd\b)))/g, "$1 &ndash; $2");
    }, function (text) {
        return text.replace(/(\w)<br\s*?>(\w)/g, "$1 $2");
    }, function (text) {
        return text.replace(/(\w)\s*?–\s*?(\w)/g, "$1 &ndash; $2");
    }];

    return function (scribe) {
        // for now this just exposes a list of
        // commands to do the text cleanup, rather than doing it some
        // weird way with sanitizers
        var cleanupCommand = new scribe.api.Command("Cleanup");

        cleanupCommand.execute = function () {
            var content = scribe.el.innerHTML;

            var temp = filters.reduce(function (val, fn) {
                return fn(val);
            }, content);

            scribe.setHTML(temp, true);
        };

        cleanupCommand.queryEnabled = function () {
            return true;
        };

        scribe.commands[COMMAND_NAME] = cleanupCommand;
    };
};

},{}]},{},[1])(1)
});