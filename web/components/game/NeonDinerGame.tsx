"use client";

import { strings } from "@/lib/strings";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { gameReducer, initialGameState, HOST, KITCHEN, TABLE_POS } from "./gameReducer";
import type { GameState } from "./types";
import { GRID_H, GRID_W } from "./types";

const SWIPE_MIN = 28;
const TAP_MAX = 14;

function cellLabel(
  x: number,
  y: number,
  state: GameState,
): { bg: string; label: string } {
  if (x === KITCHEN.x && y === KITCHEN.y) {
    const k = state.kitchen;
    let label = "KITCHEN";
    if (k.phase === "cooking") label = `COOK ${Math.ceil(k.leftMs / 1000)}s`;
    if (k.phase === "ready") label = "PICK UP!";
    return {
      bg: "from-[#1a1035] to-[#0f2844]",
      label,
    };
  }
  if (x === HOST.x && y === HOST.y) {
    return {
      bg: "from-[#301028] to-[#180820]",
      label: `HOST · queue ${state.queue}`,
    };
  }
  const ti = TABLE_POS.find((t) => t.x === x && t.y === y);
  if (ti) {
    const t = state.tables[ti.id];
    if (t.phase === "empty")
      return { bg: "from-[#0c1220] to-[#101828]", label: `T${ti.id + 1} · free` };
    if (t.phase === "dirty")
      return { bg: "from-[#281008] to-[#180810]", label: `T${ti.id + 1} · clear` };
    if (t.phase === "eating")
      return { bg: "from-[#103018] to-[#082018]", label: `T${ti.id + 1} · eating` };
    if (t.phase === "seated") {
      const p = Math.round(t.patience);
      if (t.sub === "need_order")
        return {
          bg: "from-[#201040] to-[#180830]",
          label: `T${ti.id + 1} · order (${p}%)`,
        };
      if (t.sub === "waiting_kitchen")
        return {
          bg: "from-[#102850] to-[#081838]",
          label: `T${ti.id + 1} · cooking`,
        };
      return {
        bg: "from-[#104030] to-[#082820]",
        label: `T${ti.id + 1} · serve (${p}%)`,
      };
    }
  }
  return { bg: "from-[#060a12] to-[#0a101c]", label: "" };
}

export function NeonDinerGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialGameState);
  const boardRef = useRef<HTMLDivElement>(null);
  const ptr = useRef<{
    x: number;
    y: number;
    t: number;
    id: number;
  } | null>(null);
  const pid = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = now - last;
      last = now;
      if (dt > 0 && dt < 200) {
        dispatch({ type: "tick", dt });
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toGrid = useCallback((clientX: number, clientY: number) => {
    const el = boardRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const gx = ((clientX - r.left) / r.width) * GRID_W;
    const gy = ((clientY - r.top) / r.height) * GRID_H;
    const x = Math.floor(gx);
    const y = Math.floor(gy);
    if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) return null;
    return { x, y };
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    pid.current += 1;
    const id = pid.current;
    ptr.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, id };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: React.PointerEvent) {
    const start = ptr.current;
    ptr.current = null;
    if (!start || start.id !== pid.current) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dist = Math.hypot(dx, dy);

    if (dist >= SWIPE_MIN) {
      if (Math.abs(dx) >= Math.abs(dy)) {
        dispatch({ type: "move", dx: dx > 0 ? 1 : -1, dy: 0 });
      } else {
        dispatch({ type: "move", dx: 0, dy: dy > 0 ? 1 : -1 });
      }
      return;
    }

    if (dist <= TAP_MAX) {
      const g = toGrid(e.clientX, e.clientY);
      if (g) dispatch({ type: "tap", x: g.x, y: g.y });
    }
  }

  const carrying = state.carryingFoodForTable;
  const status = state.status;

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex justify-between font-mono text-xs text-cyan-200/80">
        <span>
          {strings.score}: {state.score}
        </span>
        <span>
          {strings.combo}: x{state.combo}
        </span>
        <span>
          {strings.time}: {Math.ceil(state.timeLeftMs / 1000)}s
        </span>
      </div>
      {carrying !== null ? (
        <div className="mb-2 rounded border border-lime-400/40 bg-lime-500/10 px-2 py-1 text-center text-xs font-mono text-lime-200">
          Carrying order for Table {carrying + 1}
        </div>
      ) : null}
      <div
        ref={boardRef}
        className="relative touch-none select-none overflow-hidden rounded-xl border border-cyan-500/20 bg-[#020508] shadow-[0_0_40px_rgba(0,255,255,0.06)]"
        style={{
          aspectRatio: `${GRID_W} / ${GRID_H}`,
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          ptr.current = null;
        }}
      >
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${GRID_W}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_H}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_H * GRID_W }).map((_, i) => {
            const x = i % GRID_W;
            const y = Math.floor(i / GRID_W);
            const { bg, label } = cellLabel(x, y, state);
            return (
              <div
                key={i}
                className={`relative flex items-center justify-center border border-white/[0.04] bg-gradient-to-br ${bg} p-0.5`}
              >
                {label ? (
                  <span className="text-center text-[0.55rem] leading-tight text-white/70">
                    {label}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute rounded-full border-2 border-fuchsia-400 shadow-[0_0_12px_#ff00ff]"
          style={{
            width: `${100 / GRID_W}%`,
            height: `${100 / GRID_H}%`,
            left: `${(state.player.x / GRID_W) * 100}%`,
            top: `${(state.player.y / GRID_H) * 100}%`,
            boxSizing: "border-box",
          }}
        />
      </div>
      <p className="mt-2 text-center text-[0.65rem] text-white/40">
        {strings.swipeHint}
      </p>
      {status !== "playing" ? (
        <div className="mt-4 rounded-xl border border-fuchsia-500/40 bg-[#180818]/95 p-4 text-center">
          <p className="mb-2 font-mono text-fuchsia-200">
            {status === "won" ? strings.shiftEnd : strings.gameOverPatience}
          </p>
          <p className="mb-3 font-mono text-lg text-white">
            {strings.score}: {state.score}
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="rounded-lg border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 text-sm text-cyan-100"
          >
            {strings.playAgain}
          </button>
        </div>
      ) : null}
    </div>
  );
}
