declare namespace nkruntime {
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

  export interface Presence {
    userId: string;
    sessionId: string;
    username: string;
    node: string;
    status?: string;
  }

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

  export interface MatchMessage {
    sender: Presence;
    opCode: number;
    data: Uint8Array;
    reliable: boolean;
    receiveTime: number;
  }

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

  export interface Nakama {
    authenticateDevice(
      id: string,
      create?: boolean,
      username?: string
    ): string;

    binaryToString(b: Uint8Array | ArrayBuffer): string;

    matchCreate(module: string, params?: { [key: string]: string }): string;

    leaderboardCreate(
      id: string,
      authoritative: boolean,
      sortOrder: SortOrder,
      operator: Operator,
      resetSchedule: ResetSchedule | string,
      metadata: { [key: string]: unknown }
    ): void;

    leaderboardRecordWrite(
      id: string,
      ownerId: string,
      username?: string,
      score?: number,
      subscore?: number,
      metadata?: { [key: string]: unknown }
    ): LeaderboardRecord;

    leaderboardRecordsList(
      id: string,
      ownerIds?: string[],
      limit?: number,
      cursor?: string,
      expiry?: number
    ): LeaderboardRecordList;

    storageRead(
      reads: StorageReadRequest[]
    ): StorageObject[];

    storageWrite(
      writes: StorageWriteRequest[]
    ): StorageWriteAck[];

    accountGetId(userId: string): Account;

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

  export type MatchSignalFunction<T> = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    dispatcher: MatchDispatcher,
    tick: number,
    state: T,
    data: string         
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

  export type InitModule = (
    ctx: Context,
    logger: Logger,
    nk: Nakama,
    initializer: Initializer
  ) => void;
}