// Nakama runtime type declarations for TypeScript server-side modules.
// These types mirror the nkruntime global namespace injected by the Nakama server.
// Based on Nakama 3.x runtime API.

declare namespace nkruntime {
  /** Log levels */
  export interface Logger {
    debug(format: string, ...args: unknown[]): void;
    info(format: string, ...args: unknown[]): void;
    warn(format: string, ...args: unknown[]): void;
    error(format: string, ...args: unknown[]): void;
  }

  export interface Context {
    env: { [key: string]: string };
    executionMode: number;
    headers?: { [key: string]: string[] };
    ip?: string;
    matchId?: string;
    matchLabel?: string;
    matchNode?: string;
    matchTick?: number;
    node: string;
    queryParams: { [key: string]: string };
    sessionId?: string;
    userId?: string;
    username?: string;
    userSessionExpiry?: number;
    vars: { [key: string]: string };
    clientIp?: string;
    clientPort?: string;
    lang?: string;
    tags?: { [key: string]: string };
  }

  /** Presence in a match (a connected player). */
  export interface Presence {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
    status?: string;
  }

  /** Dispatcher for broadcasting messages in a match. */
  export interface MatchDispatcher {
    broadcastMessage(
      opCode: number,
      data: string | null,
      presences: Presence[] | null,
      sender: Presence | null,
      reliable: boolean
    ): void;
    matchKick(presences: Presence[]): void;
    matchLabelUpdate(label: string): void;
  }

  /** A message received in matchLoop from a client. */
  export interface MatchMessage {
    sender: Presence;
    opCode: number;
    data: Uint8Array;
    reliable: boolean;
    receiveTime: number;
  }

  /** A matchmaker result entry (one matched player). */
  export interface MatchmakerResult {
    presence: Presence;
    properties: { [key: string]: boolean | number | string };
    ticket: string;
    token: string;
    users: MatchmakerUser[];
  }

  export interface MatchmakerUser {
    presence: Presence;
    partyId?: string;
    properties: { [key: string]: boolean | number | string };
  }

  // ─── Sort Order & Operator enums ─────────────────────────────
  export const enum SortOrder {
    ASCENDING = 0,
    DESCENDING = 1,
  }

  export const enum Operator {
    BEST = 0,
    SET = 1,
    INCREMENT = 2,
    DECREMENT = 3,
  }

  export const enum ResetSchedule {
    NEVER = '',
    DAILY = '0 0 * * *',
    WEEKLY = '0 0 * * 1',
    MONTHLY = '0 0 1 * *',
  }

  // ─── Leaderboard Record ───────────────────────────────────────
  export interface LeaderboardRecord {
    leaderboardId: string;
    ownerId: string;
    username?: string;
    score: number;
    subscore: number;
    numScore: number;
    metadata?: string;
    createTime?: number;
    updateTime?: number;
    expiryTime?: number;
    rank?: number;
    maxNumScore?: number;
  }

  // ─── Nakama server-side API ───────────────────────────────────
  export interface Nakama {
    /** Authenticate or create a device account. */
    authenticateDevice(
      id: string,
      create?: boolean,
      username?: string
    ): string;

    /** Convert a binary (Uint8Array) match message payload to a string. */
    binaryToString(b: Uint8Array | ArrayBuffer): string;

    /** Create a new authoritative server match using the given handler name. */
    matchCreate(module: string, params?: { [key: string]: string }): string;

    /** Create a leaderboard. */
    leaderboardCreate(
      id: string,
      authoritative: boolean,
      sortOrder: SortOrder,
      operator: Operator,
      resetSchedule: ResetSchedule | string,
      metadata: { [key: string]: unknown }
    ): void;

    /** Write a record to a leaderboard. */
    leaderboardRecordWrite(
      id: string,
      ownerId: string,
      username?: string,
      score?: number,
      subscore?: number,
      metadata?: { [key: string]: unknown }
    ): LeaderboardRecord;

    /** List records from a leaderboard. */
    leaderboardRecordsList(
      id: string,
      ownerIds?: string[],
      limit?: number,
      cursor?: string,
      expiry?: number
    ): LeaderboardRecordList;

    /** Read a value from Nakama storage. */
    storageRead(
      reads: StorageReadRequest[]
    ): StorageObject[];

    /** Write values to Nakama storage. */
    storageWrite(
      writes: StorageWriteRequest[]
    ): StorageWriteAck[];

    /** Get a user account. */
    accountGetId(userId: string): Account;

    /** Update account. */
    accountUpdateId(
      userId: string,
      username?: string,
      displayName?: string,
      avatarUrl?: string,
      langTag?: string,
      location?: string,
      timezone?: string,
      metadata?: { [key: string]: unknown }
    ): void;
  }

  export interface LeaderboardRecordList {
    records: LeaderboardRecord[];
    ownerRecords: LeaderboardRecord[];
    nextCursor: string | undefined;
    prevCursor: string | undefined;
  }

  export interface StorageReadRequest {
    collection: string;
    key: string;
    userId: string;
  }

  export interface StorageObject {
    collection: string;
    key: string;
    userId: string;
    value: { [key: string]: unknown };
    version: string;
    permissionRead: number;
    permissionWrite: number;
    createTime: number;
    updateTime: number;
  }

  export interface StorageWriteRequest {
    collection: string;
    key: string;
    userId: string;
    value: { [key: string]: unknown };
    version?: string;
    permissionRead?: number;
    permissionWrite?: number;
  }

  export interface StorageWriteAck {
    collection: string;
    key: string;
    userId: string;
    version: string;
  }

  export interface Account {
    user: User;
    wallet: string;
    email: string;
    devices: AccountDevice[];
    customId: string;
    verifyTime: number;
    disableTime: number;
  }

  export interface User {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    langTag: string;
    location: string;
    timezone: string;
    metadata: { [key: string]: unknown };
    facebookId: string;
    googleId: string;
    gamecenterId: string;
    steamId: string;
    online: boolean;
    edgeCount: number;
    createTime: number;
    updateTime: number;
  }

  export interface AccountDevice {
    id: string;
    vars: { [key: string]: string };
  }

  // ─── Match Handler function signatures ───────────────────────

  export type MatchInitFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    params: { [key: string]: string }
  ) => { state: T; tickRate: number; label: string };

  export type MatchJoinAttemptFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presence: Presence,
    metadata: { [key: string]: unknown }
  ) => { state: T; accept: boolean; rejectMessage?: string } | null;

  export type MatchJoinFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presences: Presence[]
  ) => { state: T } | null;

  export type MatchLeaveFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    presences: Presence[]
  ) => { state: T } | null;

  export type MatchLoopFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    messages: MatchMessage[]
  ) => { state: T } | null;

  export type MatchTerminateFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    graceSeconds: number
  ) => { state: T } | null;

  // FIXED: matchSignal requires 7 parameters — `data` is the signal payload
  // sent by nk.matchSignal(). The goja runtime validates arity and throws
  // "matchSignal not found" if the function has fewer than 7 parameters.
  export type MatchSignalFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    data: string          // ← parameter 7 — required by Nakama runtime
  ) => { state: T; data: string } | null;

  export interface MatchHandler<T> {
    matchInit: MatchInitFunction<T>;
    matchJoinAttempt: MatchJoinAttemptFunction<T>;
    matchJoin: MatchJoinFunction<T>;
    matchLeave: MatchLeaveFunction<T>;
    matchLoop: MatchLoopFunction<T>;
    matchTerminate: MatchTerminateFunction<T>;
    matchSignal: MatchSignalFunction<T>;
  }

  export type MatchmakerMatchedFunction = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    matches: MatchmakerResult[]
  ) => string | void;

  // ─── Initializer (used in InitModule) ────────────────────────
  export interface Initializer {
    registerMatch<T>(name: string, handlers: MatchHandler<T>): void;
    registerMatchmakerMatched(fn: MatchmakerMatchedFunction): void;
    registerRpc(id: string, fn: RpcFunction): void;
  }

  export type RpcFunction = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    payload: string
  ) => string | void;

  // ─── InitModule ───────────────────────────────────────────────
  export type InitModule = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    initializer: Initializer
  ) => void;
}