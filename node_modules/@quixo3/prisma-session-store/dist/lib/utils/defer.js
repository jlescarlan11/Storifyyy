"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defer = void 0;
/**
 * Runs a callback with a number of arguments on the next tick
 *
 * @param callback the function to run in the future
 * @param args the arguments for the `callback` function when it is run
 */
var defer = function (callback) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    setImmediate(function () {
        callback.apply(void 0, args);
    });
};
exports.defer = defer;
