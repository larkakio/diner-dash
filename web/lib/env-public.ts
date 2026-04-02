import type { Address } from "viem";

export function getCheckInContractAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || raw === "0x0000000000000000000000000000000000000000") {
    return undefined;
  }
  return raw as Address;
}
