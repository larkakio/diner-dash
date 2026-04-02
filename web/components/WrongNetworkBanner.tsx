"use client";

import { strings } from "@/lib/strings";
import { getTargetChain } from "@/lib/chains";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

export function WrongNetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const target = getTargetChain();
  const wrong =
    isConnected && chainId !== undefined && chainId !== target.id;

  if (!wrong) return null;

  return (
    <div
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ff00aa]/50 bg-[#1a0520]/90 px-3 py-2 text-sm text-[#ff66cc] shadow-[0_0_20px_rgba(255,0,170,0.25)]"
      role="status"
    >
      <span>{strings.wrongNetwork}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchChain({ chainId: target.id })}
        className="rounded-md border border-cyan-400/60 bg-cyan-500/10 px-3 py-1 text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50"
      >
        {strings.switchNetwork}
      </button>
    </div>
  );
}
