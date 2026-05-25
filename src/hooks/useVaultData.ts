// src/hooks/useVaultData.ts
// Polls vault + USDC state from Arbitrum. Refreshes every 15 seconds.

import { useState, useEffect, useCallback } from "react";
import { formatUnits, parseUnits, type PublicClient } from "viem";
import { publicClient as defaultClient } from "../lib/publicClient";
import { VAULT_ADDRESS, USDC_ADDRESS, VAULT_ABI, ERC20_ABI } from "../lib/contracts";

export type VaultData = {
  totalAssets: bigint;       // raw asset units
  totalSupply: bigint;       // raw share units
  depositCap: bigint;        // raw asset units; 0 = unlimited
  paused: boolean;
  userShares: bigint;        // raw share balance of connected wallet
  userUsdcBalance: bigint;   // raw asset balance of connected wallet
  userUsdcAllowance: bigint; // current allowance of user → vault
  shareDecimals: number;
  assetDecimals: number;
  loading: boolean;
  error: string | null;
  // userEthBalance: bigint;   // raw ETH balance of connected wallet
};

const INITIAL: VaultData = {
  totalAssets: 0n,
  totalSupply: 0n,
  depositCap: 0n,
  paused: false,
  userShares: 0n,
  userUsdcBalance: 0n,
  userUsdcAllowance: 0n,
  shareDecimals: 9,
  assetDecimals: 6,
  loading: true,
  error: null,
  // userEthBalance: 0n,
};

export function useVaultData(
  userAddress: `0x${string}` | null,
  vaultAddress: `0x${string}` = VAULT_ADDRESS,
  assetAddress: `0x${string}` = USDC_ADDRESS,
  client: PublicClient = defaultClient,
) {
  const [data, setData] = useState<VaultData>(INITIAL);

  const fetch = useCallback(async () => {
    try {
      // Static calls that don't depend on user
      const [totalAssets, totalSupply, depositCap, paused, assetDecimals, shareDecimals] = await Promise.all([
        client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "totalAssets" }),
        client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "totalSupply" }),
        client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "depositCap" }),
        client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "paused" }),
        client.readContract({ address: assetAddress, abi: ERC20_ABI, functionName: "decimals" }),
        client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "decimals" }),
      ]);

      let userShares = 0n;
      let userUsdcBalance = 0n;
      let userUsdcAllowance = 0n;
      // let userEthBalance= 0n;

      if (userAddress) {
        [userShares, userUsdcBalance, userUsdcAllowance] = await Promise.all([
          client.readContract({ address: vaultAddress, abi: VAULT_ABI, functionName: "balanceOf", args: [userAddress] }),
          client.readContract({ address: assetAddress, abi: ERC20_ABI, functionName: "balanceOf", args: [userAddress] }),
          client.readContract({ address: assetAddress, abi: ERC20_ABI, functionName: "allowance", args: [userAddress, vaultAddress] }),
          // client.getBalance({ address: userAddress }),
        ]);
      }

      setData({
        totalAssets: totalAssets as bigint,
        totalSupply: totalSupply as bigint,
        depositCap: depositCap as bigint,
        paused: paused as boolean,
        userShares: userShares as bigint,
        userUsdcBalance: userUsdcBalance as bigint,
        userUsdcAllowance: userUsdcAllowance as bigint,
        shareDecimals: Number(shareDecimals),
        assetDecimals: Number(assetDecimals),
        loading: false,
        error: null,
        // userEthBalance: userEthBalance as bigint,

      });
    } catch (err: unknown) {
      setData((s) => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, [assetAddress, client, userAddress, vaultAddress]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 15_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { data, refetch: fetch };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Format raw token units to a localized string */
export function formatToken(
  raw: bigint,
  tokenDecimals: number,
  displayDecimals = 2,
): string {
  if (raw === 0n) return Number(0).toFixed(displayDecimals);
  const n = Number(formatUnits(raw, tokenDecimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
}

/** Parse a human token string to raw bigint */
export function parseToken(value: string, tokenDecimals: number): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  try {
    return parseUnits(trimmed, tokenDecimals);
  } catch {
    return 0n;
  }
}