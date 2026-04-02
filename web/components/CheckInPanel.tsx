"use client";

import { checkInAbi } from "@/lib/check-in-abi";
import { getCheckInDataSuffix } from "@/lib/builder-code";
import { getCheckInContractAddress } from "@/lib/env-public";
import { strings } from "@/lib/strings";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export function CheckInPanel() {
  const { address, isConnected } = useAccount();
  const contract = getCheckInContractAddress();
  const suffix = getCheckInDataSuffix();

  const { data: canCheck, refetch, isFetching } = useReadContract({
    address: contract,
    abi: checkInAbi,
    functionName: "canCheckInToday",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(isConnected && address && contract) },
  });

  const { data: streak } = useReadContract({
    address: contract,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(isConnected && address && contract) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  async function onCheckIn() {
    if (!contract || !address) return;
    await writeContractAsync({
      address: contract,
      abi: checkInAbi,
      functionName: "checkIn",
      dataSuffix: suffix,
    });
    await refetch();
  }

  if (!isConnected) {
    return null;
  }

  if (!contract) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-100/90">
        {strings.configureContract}
      </p>
    );
  }

  const ready = canCheck === true;

  return (
    <div className="rounded-xl border border-[#00ffcc]/25 bg-[#061a18]/80 p-4 shadow-[0_0_24px_rgba(0,255,204,0.08)]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-[#9fffea]">
          {ready ? strings.canCheckIn : strings.checkedInToday}
        </span>
        {typeof streak === "bigint" && (
          <span className="font-mono text-xs text-fuchsia-300">
            {strings.streak(Number(streak))}
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={!ready || isPending || isFetching}
        onClick={() => void onCheckIn()}
        className="w-full rounded-lg border border-[#00ffcc]/40 bg-[#00ffcc]/10 py-2.5 text-sm font-semibold text-[#bffff6] transition enabled:hover:bg-[#00ffcc]/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? strings.checkingIn : strings.checkIn}
      </button>
    </div>
  );
}
