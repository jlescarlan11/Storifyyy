"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTTL = void 0;
var constants_1 = require("./constants");
/**
 *  Determines the TTL (Time to Live) for a given session with given options
 * @param options the options to determine the TTL
 * @param session the session data
 * @param sid the id of the current session
 */
var getTTL = function (options, session, sid) {
    var _a, _b;
    if (typeof options.ttl === 'number')
        return options.ttl;
    if (typeof options.ttl === 'function')
        return options.ttl(options, session, sid);
    if (options.ttl !== undefined)
        throw new TypeError('`options.ttl` must be a number or function.');
    var maxAge = (_b = (_a = session.cookie) === null || _a === void 0 ? void 0 : _a.maxAge) !== null && _b !== void 0 ? _b : null;
    return typeof maxAge === 'number' ? Math.floor(maxAge) : constants_1.ONE_DAY_MS;
};
exports.getTTL = getTTL;
