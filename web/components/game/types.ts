export const GRID_W = 9;
export const GRID_H = 11;

export type TableState =
  | { phase: "empty" }
  | {
      phase: "seated";
      patience: number;
      sub: "need_order" | "waiting_kitchen" | "waiting_serve";
      orderId: number;
    }
  | { phase: "eating"; timer: number }
  | { phase: "dirty" };

export type KitchenState =
  | { phase: "idle" }
  | { phase: "cooking"; leftMs: number; forTableId: number }
  | { phase: "ready"; forTableId: number };

export type GameStatus = "playing" | "won" | "lost_patience";

export interface GameState {
  player: { x: number; y: number };
  tables: TableState[];
  queue: number;
  kitchen: KitchenState;
  carryingFoodForTable: number | null;
  score: number;
  combo: number;
  timeLeftMs: number;
  status: GameStatus;
  walkouts: number;
  orderSeq: number;
}

export type GameAction =
  | { type: "move"; dx: number; dy: number }
  | { type: "tick"; dt: number }
  | { type: "tap"; x: number; y: number }
  | { type: "reset" };
