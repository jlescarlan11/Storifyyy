import type { ILevel, ILogger } from '../@types/logger';
/**
 * An object that handles logging to a given logger based on the logging level
 */
export declare class ManagedLogger {
    private readonly logger;
    private readonly level;
    /**
     * Creates a ManagedLogger that will log only at given severity levels
     * @param logger a logger where logs will be logged to. If set
     * to false then logging is disabled
     * @param level The level(s) of severity to log
     */
    constructor(logger: ILogger | false, level: ILevel | ILevel[]);
    /**
     * Check if logging is enabled for a given severity level
     * @param level The level to check if logging is enabled for
     */
    private checkLevel;
    /**
     * Logs out errors via the logger if the `error` level is enabled
     * @param error the error to log
     */
    error(error: unknown): void;
    /**
     * Logs out information via the logger if the `log` level is enabled
     * @param message the message to log
     */
    log(message: string): void;
    /**
     * Logs out warnings via the logger if the `warn` level is enabled
     * @param message the message to log
     */
    warn(message: string): void;
}
