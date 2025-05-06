"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedLogger = void 0;
/**
 * An object that handles logging to a given logger based on the logging level
 */
var ManagedLogger = /** @class */ (function () {
    /**
     * Creates a ManagedLogger that will log only at given severity levels
     * @param logger a logger where logs will be logged to. If set
     * to false then logging is disabled
     * @param level The level(s) of severity to log
     */
    function ManagedLogger(logger, level) {
        this.logger = logger;
        this.level = level;
    }
    /**
     * Check if logging is enabled for a given severity level
     * @param level The level to check if logging is enabled for
     */
    ManagedLogger.prototype.checkLevel = function (level) {
        return Array.isArray(this.level)
            ? this.level.includes(level)
            : this.level === level;
    };
    /**
     * Logs out errors via the logger if the `error` level is enabled
     * @param error the error to log
     */
    ManagedLogger.prototype.error = function (error) {
        var _a, _b;
        if (this.logger && this.checkLevel('error'))
            (_b = (_a = this.logger).error) === null || _b === void 0 ? void 0 : _b.call(_a, error);
    };
    /**
     * Logs out information via the logger if the `log` level is enabled
     * @param message the message to log
     */
    ManagedLogger.prototype.log = function (message) {
        var _a, _b;
        if (this.logger && this.checkLevel('log'))
            (_b = (_a = this.logger).log) === null || _b === void 0 ? void 0 : _b.call(_a, message);
    };
    /**
     * Logs out warnings via the logger if the `warn` level is enabled
     * @param message the message to log
     */
    ManagedLogger.prototype.warn = function (message) {
        var _a, _b;
        if (this.logger && this.checkLevel('warn'))
            (_b = (_a = this.logger).warn) === null || _b === void 0 ? void 0 : _b.call(_a, message);
    };
    return ManagedLogger;
}());
exports.ManagedLogger = ManagedLogger;
