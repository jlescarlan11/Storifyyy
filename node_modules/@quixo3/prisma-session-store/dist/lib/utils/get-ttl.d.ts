import type { SessionData } from 'express-session';
import type { PartialDeep } from 'type-fest';
import type { IOptions } from '../../@types';
/**
 *  Determines the TTL (Time to Live) for a given session with given options
 * @param options the options to determine the TTL
 * @param session the session data
 * @param sid the id of the current session
 */
export declare const getTTL: <M extends string>(options: Pick<IOptions<M>, "ttl">, session: PartialDeep<SessionData>, sid: string) => number;
