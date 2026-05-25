// src/hooks/useVaultActions.ts
// Write actions: approve USDC, deposit into vault, redeem shares

import { useState } from "react";
import type { PublicClient } from "viem";
import type { AppWalletClient } from "./useWallet";
import { publicClient as defaultClient } from "../lib/publicClient";
import { VAULT_ADDRESS, USDC_ADDRESS, VAULT_ABI, ERC20_ABI, ERC20_PERMIT_ABI } from "../lib/contracts";
import type { PermitConfig } from "../config/vaults";

export type TxStatus =
  | "idle"
  | "signing"
  | "approving"
  | "depositing"
  | "minting"
  | "withdrawing"
  | "redeeming"
  | "success"
  | "error";

const PERMIT_TYPES = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

function splitSignature(sig: `0x${string}`) {
  const r = `0x${sig.slice(2, 66)}` as `0x${string}`;
  const s = `0x${sig.slice(66, 130)}` as `0x${string}`;
  let v = Number.parseInt(sig.slice(130, 132), 16);
  if (v < 27) v += 27;
  return { v, r, s };
}

export function useVaultActions(
  walletClient: AppWalletClient | null,
  userAddress: `0x${string}` | null,
  vaultAddress: `0x${string}` = VAULT_ADDRESS,
  assetAddress: `0x${string}` = USDC_ADDRESS,
  onSuccess?: () => void,
  client: PublicClient = defaultClient,
  permit?: PermitConfig,
  chainId?: number,
) {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }

  // ── deposit: approve if needed, then deposit ──────────────────────────────
  async function signPermit(rawAssets: bigint) {
    if (!walletClient || !userAddress) return null;

    const [nonce, assetName] = await Promise.all([
      client.readContract({
        address: assetAddress,
        abi: ERC20_PERMIT_ABI,
        functionName: "nonces",
        args: [userAddress],
      }) as Promise<bigint>,
      client.readContract({
        address: assetAddress,
        abi: ERC20_ABI,
        functionName: "name",
      }) as Promise<string>,
    ]);

    let version = permit?.version;
    if (!version) {
      try {
        version = (await client.readContract({
          address: assetAddress,
          abi: ERC20_PERMIT_ABI,
          functionName: "version",
        })) as string;
      } catch {
        version = "1";
      }
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 15 * 60);
    const domain = {
      name: assetName,
      version,
      chainId: chainId ?? 0,
      verifyingContract: assetAddress,
    } as const;

    const message = {
      owner: userAddress,
      spender: vaultAddress,
      value: rawAssets,
      nonce,
      deadline,
    } as const;

    if (!walletClient.signTypedData) return null;

    setStatus("signing");
    const signature = await walletClient.signTypedData({
      account: userAddress,
      domain,
      types: PERMIT_TYPES,
      primaryType: "Permit",
      message,
    });

    const { v, r, s } = splitSignature(signature);
    return { v, r, s, deadline };
  }

  async function deposit(rawAssets: bigint, currentAllowance: bigint) {
    if (!walletClient || !userAddress) return;
    setError(null);
    try {
      if (permit?.type === "eip2612" && chainId) {
        const sig = await signPermit(rawAssets);
        if (sig) {
          setStatus("depositing");
          const depositHash = await walletClient.writeContract({
            address: vaultAddress,
            abi: VAULT_ABI,
            functionName: "depositWithPermit",
            args: [rawAssets, userAddress, sig.deadline, sig.v, sig.r, sig.s],
            account: userAddress,
          });
          await client.waitForTransactionReceipt({ hash: depositHash });
          setTxHash(depositHash);
          setStatus("success");
          onSuccess?.();
          return;
        }
      }

      // Step 1: approve if allowance insufficient
      if (currentAllowance < rawAssets) {
        setStatus("approving");
        const approveHash = await walletClient.writeContract({
          address: assetAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [vaultAddress, rawAssets],
          account: userAddress,
        });
        await client.waitForTransactionReceipt({ hash: approveHash });
      }

      // Step 2: deposit
      setStatus("depositing");
      const depositHash = await walletClient.writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [rawAssets, userAddress],
        account: userAddress,
      });
      await client.waitForTransactionReceipt({ hash: depositHash });
      setTxHash(depositHash);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      setStatus("error");
      // Surface the first readable error message
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Transaction failed";
      setError(msg);
    }
  }

  // ── mint: approve if needed, then mint exact shares ──────────────────────
  async function mint(rawShares: bigint, currentAllowance: bigint) {
    if (!walletClient || !userAddress) return;
    setError(null);
    try {
      const requiredAssets = (await client.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "previewMint",
        args: [rawShares],
      })) as bigint;

      if (currentAllowance < requiredAssets) {
        setStatus("approving");
        const approveHash = await walletClient.writeContract({
          address: assetAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [vaultAddress, requiredAssets],
          account: userAddress,
        });
        await client.waitForTransactionReceipt({ hash: approveHash });
      }

      setStatus("minting");
      const mintHash = await walletClient.writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "mint",
        args: [rawShares, userAddress],
        account: userAddress,
      });
      await client.waitForTransactionReceipt({ hash: mintHash });
      setTxHash(mintHash);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      setStatus("error");
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Transaction failed";
      setError(msg);
    }
  }

  // ── redeem: burn shares, receive USDC ─────────────────────────────────────
  async function redeem(rawShares: bigint) {
    if (!walletClient || !userAddress) return;
    setError(null);
    try {
      setStatus("redeeming");
      const hash = await walletClient.writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "redeem",
        args: [rawShares, userAddress, userAddress],
        account: userAddress,
      });
      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      setStatus("error");
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Transaction failed";
      setError(msg);
    }
  }

  // ── withdraw: receive exact assets, burn shares ──────────────────────────
  async function withdraw(rawAssets: bigint) {
    if (!walletClient || !userAddress) return;
    setError(null);
    try {
      setStatus("withdrawing");
      const hash = await walletClient.writeContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: "withdraw",
        args: [rawAssets, userAddress, userAddress],
        account: userAddress,
      });
      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      setStatus("success");
      onSuccess?.();
    } catch (err: unknown) {
      setStatus("error");
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Transaction failed";
      setError(msg);
    }
  }

  return { status, txHash, error, reset, deposit, mint, redeem, withdraw };
}