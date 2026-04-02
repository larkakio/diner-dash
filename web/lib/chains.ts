import { base, baseSepolia } from "wagmi/chains";

const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 8453);

export function getTargetChain() {
  if (id === baseSepolia.id) return baseSepolia;
  return base;
}

export const supportedChains = [base, baseSepolia] as const;
