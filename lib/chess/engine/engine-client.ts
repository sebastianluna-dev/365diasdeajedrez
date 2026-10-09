import {
  parseBestMove,
  parseCandidate,
  parseEngineInfo,
  type Candidate,
  type EngineInfo,
} from "@/lib/chess/engine-protocol";
import { turnColor } from "@/lib/chess/replay";
import { finalCandidates, recordCandidate, type CandidateLog } from "./candidate-set";
import type { EngineTransport } from "./engine-transport";

// The one place that talks UCI to Stockfish: the analysis panel, the game
// review, the bots and the calibration script all go through here.
//
// Pure module — no DOM, no Node — so the same conversation runs in a Web
// Worker, in a child process and against a scripted fake in the tests.
//
// THE RULE IT EXISTS FOR: UCI is a conversation in turns. `stop` does not halt
// a search, it asks it to finish, and until the engine answers `bestmove` it is
// still searching. Sending `position` (or `ucinewgame`) in that gap makes the
// WASM build abort with "RuntimeError: unreachable" and takes the worker down
// with it; `setoption` sent then is held by the worker script and lands AFTER
// the `position` that followed it. So `position`, `ucinewgame`, `setoption` and
// `go` only ever leave in `idle`, one request at a time, from a FIFO queue; a
// request that cannot wait (a new analysis, a new game, new options) asks the
// running search to stop and goes when its `bestmove` arrives.

/** Engine options as the code names them; each becomes one `setoption`. */
export interface EngineOptions {
  multiPv?: number;
  skillLevel?: number;
  limitStrength?: boolean;
  uciElo?: number;
  /** Megabytes. Sent explicitly: reproducing a bot's game depends on it. */
  hash?: number;
  showWdl?: boolean;
}

/**
 * A bot's budget: a depth, a number of nodes, or both (`go depth D nodes N`
 * stops at whichever comes first). NEVER time: a bot's strength must not
 * depend on the device, and nodes reproduce under Node for the calibration.
 */
export type SearchBudget = { depth: number; nodes?: number } | { nodes: number; depth?: number };

/**
 * What the device gives in a fixed time. Only the full-strength module of the
 * analysis board searches this way (`FULL_STRENGTH_PROFILE`): it is never
 * calibrated nor stored, and «instant» there means the same wait on any device.
 */
export type TimedBudget = { movetime: number; depth?: number };

export interface BestMoveRequest {
  /** The starting position; null is the initial position. */
  fen: string | null;
  /** The moves played since, in UCI: `position … moves` keeps the engine's hash useful. */
  moves: string[];
  search: SearchBudget | TimedBudget;
}

export interface BestMoveReply {
  /** The engine's own move; null when the position had none (mate or stalemate on the board). */
  bestMove: string | null;
  /** The lines it weighed, from its last complete iteration, best first (`finalCandidates`). */
  candidates: Candidate[];
}

export interface EngineClient {
  /** Resolves once the engine has answered `readyok` to the boot. */
  ready(): Promise<void>;
  /** `ucinewgame` + `isready`: forget the previous game's hash and history. */
  newGame(): Promise<void>;
  /** One `setoption` per option, then `isready`; never while a search is running. */
  setOptions(options: EngineOptions): Promise<void>;
  /**
   * Analyses `fen`, calling `onInfo` with every evaluation (White's view).
   * A newer analysis replaces this one. Returns the cancel.
   */
  analyse(request: { fen: string } & SearchBudget, onInfo: (info: EngineInfo) => void): () => void;
  /** Asks for one move and the lines it weighed. */
  bestMove(request: BestMoveRequest): Promise<BestMoveReply>;
  /** Kills the engine; whatever is pending is rejected. */
  terminate(): void;
}

/** Why a request did not get its answer. */
export class EngineError extends Error {
  constructor(
    readonly reason: "failed" | "timeout" | "terminated",
    message: string,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

/** How long `isready` may take to answer `readyok` after a new game or new options. */
const SYNC_TIMEOUT_MS = 5_000;
/** The floor of any search's watchdog. */
const SEARCH_TIMEOUT_FLOOR_MS = 5_000;
/** Nodes per millisecond assumed for the watchdog: 100 knps, a slow phone. */
const WATCHDOG_NODES_PER_MS = 100;
/** What a search bounded by depth alone is expected to take on that phone. */
const DEPTH_ONLY_EXPECTED_MS = 5_000;

/**
 * How long a search may go unanswered before the engine is taken for dead:
 * four times what its budget should take on a slow phone, never under five
 * seconds. An iOS worker killed for memory fires no `onerror`; without this a
 * bot would «think» forever.
 */
export function searchTimeoutMs(search: SearchBudget | TimedBudget): number {
  let expected: number;
  if ("movetime" in search) expected = search.movetime;
  else if (search.nodes !== undefined) expected = search.nodes / WATCHDOG_NODES_PER_MS;
  else expected = DEPTH_ONLY_EXPECTED_MS;
  return Math.max(SEARCH_TIMEOUT_FLOOR_MS, 4 * expected);
}

/** The `position` command: from the initial position or a FEN, then the moves played. */
export function positionCommand(fen: string | null, moves: readonly string[] = []): string {
  const start = fen ? `position fen ${fen}` : "position startpos";
  return moves.length > 0 ? `${start} moves ${moves.join(" ")}` : start;
}

/** The `go` command for a budget. */
export function goCommand(search: SearchBudget | TimedBudget): string {
  if ("movetime" in search) {
    return search.depth !== undefined
      ? `go movetime ${search.movetime} depth ${search.depth}`
      : `go movetime ${search.movetime}`;
  }
  const parts = ["go"];
  if (search.depth !== undefined) parts.push(`depth ${search.depth}`);
  if (search.nodes !== undefined) parts.push(`nodes ${search.nodes}`);
  return parts.join(" ");
}

/** The `setoption` commands for some options, in a fixed order. */
export function optionCommands(options: EngineOptions): string[] {
  const commands: string[] = [];
  const set = (name: string, value: string | number | boolean | undefined) => {
    if (value !== undefined) commands.push(`setoption name ${name} value ${String(value)}`);
  };
  set("Hash", options.hash);
  set("MultiPV", options.multiPv);
  set("UCI_LimitStrength", options.limitStrength);
  set("UCI_Elo", options.uciElo);
  set("Skill Level", options.skillLevel);
  set("UCI_ShowWDL", options.showWdl);
  return commands;
}

type Job =
  | {
      kind: "sync";
      commands: string[];
      resolve: () => void;
      reject: (error: EngineError) => void;
    }
  | {
      kind: "best";
      request: BestMoveRequest;
      log: CandidateLog;
      resolve: (reply: BestMoveReply) => void;
      reject: (error: EngineError) => void;
    }
  | {
      kind: "analyse";
      fen: string;
      search: SearchBudget;
      onInfo: (info: EngineInfo) => void;
      cancelled: boolean;
    };

type State = "booting" | "idle" | "syncing" | "searching" | "stopping" | "dead";

export function createEngineClient(transport: EngineTransport): EngineClient {
  let state: State = "booting";
  let current: Job | null = null;
  const queue: Job[] = [];
  let watchdog: ReturnType<typeof setTimeout> | null = null;
  let death: EngineError | null = null;

  let resolveReady!: () => void;
  let rejectReady!: (error: EngineError) => void;
  const readyPromise = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // Nobody may be awaiting the boot when the engine dies; that is not an unhandled error.
  readyPromise.catch(() => {});

  const clearWatchdog = () => {
    if (watchdog !== null) clearTimeout(watchdog);
    watchdog = null;
  };

  const armWatchdog = (ms: number) => {
    clearWatchdog();
    watchdog = setTimeout(() => fail(new EngineError("timeout", `The engine did not answer in ${ms} ms`)), ms);
  };

  const fail = (error: EngineError) => {
    if (state === "dead") return;
    state = "dead";
    death = error;
    clearWatchdog();
    rejectReady(error);
    const pending = current ? [current, ...queue] : [...queue];
    current = null;
    queue.length = 0;
    for (const job of pending) {
      if (job.kind !== "analyse") job.reject(error);
    }
    unsubscribeLine();
    unsubscribeError();
    transport.terminate();
  };

  /** Asks the running search to finish; its `bestmove` will release the turn. */
  const requestStop = () => {
    if (state !== "searching") return;
    state = "stopping";
    transport.post("stop");
  };

  const start = (job: Job) => {
    current = job;
    if (job.kind === "sync") {
      state = "syncing";
      for (const command of job.commands) transport.post(command);
      transport.post("isready");
      armWatchdog(SYNC_TIMEOUT_MS);
      return;
    }
    state = "searching";
    if (job.kind === "best") {
      transport.post(positionCommand(job.request.fen, job.request.moves));
      transport.post(goCommand(job.request.search));
      armWatchdog(searchTimeoutMs(job.request.search));
      return;
    }
    transport.post(positionCommand(job.fen));
    transport.post(goCommand(job.search));
  };

  const pump = () => {
    while (state === "idle" && current === null && queue.length > 0) {
      const job = queue.shift()!;
      if (job.kind === "analyse" && job.cancelled) continue;
      start(job);
    }
  };

  const finishCurrent = () => {
    current = null;
    state = "idle";
    clearWatchdog();
    pump();
  };

  const onLine = (line: string) => {
    if (state === "dead") return;

    if (line.startsWith("readyok")) {
      if (state === "booting") {
        state = "idle";
        resolveReady();
        pump();
      } else if (state === "syncing" && current?.kind === "sync") {
        const job = current;
        finishCurrent();
        job.resolve();
      }
      return;
    }

    if (line.startsWith("bestmove")) {
      if ((state !== "searching" && state !== "stopping") || !current || current.kind === "sync") return;
      const job = current;
      finishCurrent();
      if (job.kind === "best") job.resolve({ bestMove: parseBestMove(line), candidates: finalCandidates(job.log) });
      return;
    }

    if (!current || (state !== "searching" && state !== "stopping")) return;
    if (current.kind === "best") {
      const candidate = parseCandidate(line);
      if (candidate) recordCandidate(current.log, candidate);
    } else if (current.kind === "analyse" && !current.cancelled) {
      const info = parseEngineInfo(line, turnColor(current.fen));
      if (info) current.onInfo(info);
    }
  };

  const unsubscribeLine = transport.onLine(onLine);
  const unsubscribeError = transport.onError((error) => fail(new EngineError("failed", error.message)));

  transport.post("uci");
  transport.post("isready");

  const deadError = () => death ?? new EngineError("terminated", "The engine was terminated");

  const enqueueSync = (commands: string[]) =>
    new Promise<void>((resolve, reject) => {
      if (state === "dead") {
        reject(deadError());
        return;
      }
      queue.push({ kind: "sync", commands, resolve, reject });
      // Options and a new game cannot wait behind a search: it is asked to stop.
      if (current && current.kind !== "sync") requestStop();
      pump();
    });

  return {
    ready: () => readyPromise,

    newGame: () => enqueueSync(["ucinewgame"]),

    setOptions: (options) => enqueueSync(optionCommands(options)),

    analyse(request, onInfo) {
      if (state === "dead") return () => {};
      const { fen, ...search } = request;
      // A newer analysis replaces any that is still waiting.
      for (const job of queue) {
        if (job.kind === "analyse") job.cancelled = true;
      }
      const job: Job = { kind: "analyse", fen, search, onInfo, cancelled: false };
      queue.push(job);
      if (current?.kind === "analyse") requestStop();
      pump();
      return () => {
        if (job.cancelled) return;
        job.cancelled = true;
        if (current === job) requestStop();
      };
    },

    bestMove: (request) =>
      new Promise<BestMoveReply>((resolve, reject) => {
        if (state === "dead") {
          reject(deadError());
          return;
        }
        queue.push({ kind: "best", request, log: new Map(), resolve, reject });
        // An analysis always gives way to a move asked for.
        if (current?.kind === "analyse") requestStop();
        pump();
      }),

    terminate: () => fail(new EngineError("terminated", "The engine was terminated")),
  };
}
