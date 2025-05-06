"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = void 0;
/**
 * Creates an array starting at 0 going to `length` -1
 * @param length the value to end just before reaching
 */
var range = function (length) { return Array.from({ length: length }, function (_, i) { return i; }); };
exports.range = range;
