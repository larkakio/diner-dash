import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/**
 * ERC-8021 suffix for Builder Code attribution.
 * Prefer `NEXT_PUBLIC_BUILDER_CODE` (bc_… from base.dev); ox turns it into chain calldata — do not paste bc_ as raw hex.
 * For edge cases, set `NEXT_PUBLIC_BUILDER_CODE_SUFFIX` to a full `0x…` hex from Base docs.
 */
export function getCheckInDataSuffix(): Hex | undefined {
  const hexOverride = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (hexOverride?.startsWith("0x") && hexOverride.length > 2) {
    return hexOverride as Hex;
  }
  const code = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  if (!code) return undefined;
  return Attribution.toDataSuffix({ codes: [code] });
}
