"use client";

import { strings } from "@/lib/strings";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-xl border border-cyan-400/50 bg-[#0d1520] px-4 py-3 font-medium text-cyan-200 shadow-[0_0_24px_rgba(0,255,255,0.12)] transition hover:border-cyan-300 hover:shadow-[0_0_28px_rgba(0,255,255,0.2)]"
        >
          {strings.connectWallet}
        </button>
        {open ? (
          <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-fuchsia-500/30 bg-[#120818]/95 p-2 shadow-xl backdrop-blur-md">
            {connectors.map((c) => (
              <li key={c.uid}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    connect({ connector: c });
                    setOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-fuchsia-100 hover:bg-fuchsia-500/10"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  const short =
    address && `${address.slice(0, 6)}…${address.slice(-4)}`;
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-400/30 bg-[#0a1814]/90 px-3 py-2">
      <span className="truncate font-mono text-xs text-emerald-200/90">
        {short}
      </span>
      <button
        type="button"
        onClick={() => disconnect()}
        className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
      >
        {strings.disconnect}
      </button>
    </div>
  );
}
