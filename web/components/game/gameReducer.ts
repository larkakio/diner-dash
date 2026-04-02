import type {
  GameAction,
  GameState,
  GameStatus,
  KitchenState,
  TableState,
} from "./types";
import { GRID_H, GRID_W } from "./types";

const KITCHEN = { x: 4, y: 1 };
const HOST = { x: 4, y: 10 };
const TABLE_POS: { id: number; x: number; y: number }[] = [
  { id: 0, x: 2, y: 4 },
  { id: 1, x: 6, y: 4 },
  { id: 2, x: 2, y: 7 },
  { id: 3, x: 6, y: 7 },
];

const COOK_MS = 3500;
const EAT_MS = 2200;
const SHIFT_MS = 90_000;
const SPAWN_MS = 11_000;
const PATIENCE_DECAY = 4.2; // per second

function isBlocked(x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return true;
  if (x === KITCHEN.x && y === KITCHEN.y) return true;
  return TABLE_POS.some((t) => t.x === x && t.y === y);
}

function manhattan(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function initialGameState(): GameState {
  return {
    player: { x: 4, y: 8 },
    tables: [
      { phase: "empty" },
      { phase: "empty" },
      { phase: "empty" },
      { phase: "empty" },
    ],
    queue: 1,
    kitchen: { phase: "idle" },
    carryingFoodForTable: null,
    score: 0,
    combo: 0,
    timeLeftMs: SHIFT_MS,
    status: "playing",
    walkouts: 0,
    orderSeq: 1,
  };
}

let spawnAcc = 0;

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "reset") {
    spawnAcc = 0;
    return initialGameState();
  }

  if (state.status !== "playing") {
    return state;
  }

  if (action.type === "move") {
    const nx = state.player.x + action.dx;
    const ny = state.player.y + action.dy;
    if (isBlocked(nx, ny)) return state;
    return { ...state, player: { x: nx, y: ny } };
  }

  if (action.type === "tick") {
    const dt = action.dt;
    const timeLeftMs = Math.max(0, state.timeLeftMs - dt);
    spawnAcc += dt;

    const tables = state.tables.map((t) => ({ ...t })) as TableState[];
    for (const t of tables) {
      if (t.phase === "seated") {
        t.patience = Math.max(0, t.patience - (PATIENCE_DECAY * dt) / 1000);
      }
      if (t.phase === "eating") {
        t.timer -= dt;
      }
    }

    for (let i = 0; i < tables.length; i++) {
      const t = tables[i];
      if (t.phase === "eating" && t.timer <= 0) {
        tables[i] = { phase: "dirty" };
      }
    }

    let kitchen: KitchenState = state.kitchen;
    if (kitchen.phase === "cooking") {
      const left = kitchen.leftMs - dt;
      if (left <= 0) {
        kitchen = {
          phase: "ready",
          forTableId: kitchen.forTableId,
        };
        const tid = kitchen.forTableId;
        const cur = tables[tid];
        if (cur.phase === "seated" && cur.sub === "waiting_kitchen") {
          tables[tid] = {
            phase: "seated",
            patience: cur.patience,
            sub: "waiting_serve",
            orderId: cur.orderId,
          };
        }
      } else {
        kitchen = { ...kitchen, leftMs: left };
      }
    }

    let walkouts = state.walkouts;
    let status: GameStatus = state.status;
    for (let i = 0; i < tables.length; i++) {
      const t = tables[i];
      if (t.phase === "seated" && t.patience <= 0) {
        walkouts += 1;
        tables[i] = { phase: "dirty" };
        if (walkouts >= 4) {
          status = "lost_patience";
        }
      }
    }

    let queue = state.queue;
    if (spawnAcc >= SPAWN_MS && queue < 5) {
      spawnAcc = 0;
      queue += 1;
    }

    let next: GameState = {
      ...state,
      tables,
      kitchen,
      queue,
      timeLeftMs,
      walkouts,
      status,
    };

    if (timeLeftMs <= 0 && status === "playing") {
      next = { ...next, status: "won" };
    }

    return next;
  }

  if (action.type === "tap") {
    const { x: px, y: py } = state.player;
    const tx = action.x;
    const ty = action.y;
    if (manhattan({ x: px, y: py }, { x: tx, y: ty }) !== 1) {
      return state;
    }

    const tables = state.tables.map((t) => ({ ...t })) as TableState[];
    let kitchen: KitchenState = state.kitchen;
    let score = state.score;
    let combo = state.combo;
    let queue = state.queue;
    let carryingFoodForTable = state.carryingFoodForTable;

    // Host: seat next guest
    if (tx === HOST.x && ty === HOST.y && queue > 0) {
      const free = tables.findIndex((t) => t.phase === "empty");
      if (free >= 0) {
        queue -= 1;
        tables[free] = {
          phase: "seated",
          patience: 100,
          sub: "need_order",
          orderId: state.orderSeq,
        };
        return {
          ...state,
          tables,
          queue,
          orderSeq: state.orderSeq + 1,
        };
      }
      return state;
    }

    // Kitchen
    if (tx === KITCHEN.x && ty === KITCHEN.y) {
      if (kitchen.phase === "ready") {
        carryingFoodForTable = kitchen.forTableId;
        kitchen = { phase: "idle" };
        return { ...state, kitchen, carryingFoodForTable };
      }
      return state;
    }

    // Tables
    const ti = TABLE_POS.findIndex((p) => p.x === tx && p.y === ty);
    if (ti >= 0) {
      const t = tables[ti];
      if (t.phase === "seated" && t.sub === "need_order" && kitchen.phase === "idle") {
        kitchen = { phase: "cooking", leftMs: COOK_MS, forTableId: ti };
        tables[ti] = {
          phase: "seated",
          patience: t.patience,
          sub: "waiting_kitchen",
          orderId: t.orderId,
        };
        return { ...state, tables, kitchen };
      }
      if (
        t.phase === "seated" &&
        t.sub === "waiting_serve" &&
        carryingFoodForTable === ti
      ) {
        const add = 55 + Math.min(40, combo * 5);
        score += add;
        combo += 1;
        carryingFoodForTable = null;
        tables[ti] = { phase: "eating", timer: EAT_MS };
        return { ...state, tables, score, combo, carryingFoodForTable };
      }
      if (t.phase === "dirty") {
        tables[ti] = { phase: "empty" };
        score += 8;
        return { ...state, tables, score };
      }
    }

    return state;
  }

  return state;
}

export { HOST, KITCHEN, TABLE_POS };
