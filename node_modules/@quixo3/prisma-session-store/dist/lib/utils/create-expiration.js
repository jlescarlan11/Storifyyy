"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpiration = void 0;
/**
 * Creates a `Date` object that is a certain number of milliseconds in the future.
 *
 * @param shelfLifeMs the number of milliseconds before the expiration date
 * @param options to modify the way this function behaves
 */
var createExpiration = function (shelfLifeMs, options) {
    return new Date((options.rounding
        ? Math.floor(new Date().valueOf() / options.rounding) * options.rounding
        : new Date().valueOf()) + shelfLifeMs);
};
exports.createExpiration = createExpiration;
