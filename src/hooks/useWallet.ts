// src/hooks/useWallet.ts
// Handles MetaMask / any injected EIP-1193 provider connection + network guard

import { useState, useCallback, useEffect } from "react";
import { createWalletClient, custom, type Transport, type WalletClient } from "viem";
import type { Chain } from "viem/chains";
import { CHAINS, type ChainConfig } from "../config/chains";

export type AppWalletClient = WalletClient<Transport, Chain>;

export type WalletState = {
  address: `0x${string}` | null;
  isConnecting: boolean;
  error: string | null;
  walletClient: AppWalletClient | null;
  chainId: number | null;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
      on: (event: string, cb: (...args: unknown[]) => void) => void;
      removeListener: (event: string, cb: (...args: unknown[]) => void) => void;
    };
  }
}

export function useWallet(targetChain: ChainConfig = CHAINS.arbitrum) {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnecting: false,
    error: null,
    walletClient: null,
    chainId: null,
  });

  const refreshChainId = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const id = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      const parsed = Number(id);
      setState((s) => ({ ...s, chainId: parsed }));
      return parsed;
    } catch {
      return null;
    }
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const list = accounts as string[];
        if (list.length > 0) {
          const wc = createWalletClient({
            chain: targetChain.viemChain,
            transport: custom(window.ethereum!),
          });
          setState((s) => ({
            ...s,
            address: list[0] as `0x${string}`,
            walletClient: wc,
          }));
        }
      })
      .catch(() => {});
    window.ethereum
      .request({ method: "eth_chainId" })
      .then((id) => {
        const parsed = Number(id);
        setState((s) => ({ ...s, chainId: parsed }));
      })
      .catch(() => {});
  }, [targetChain]);

  // Refresh wallet client when target chain changes
  useEffect(() => {
    if (!window.ethereum || !state.address) return;
    const wc = createWalletClient({
      chain: targetChain.viemChain,
      transport: custom(window.ethereum),
    });
    setState((s) => ({ ...s, walletClient: wc }));
  }, [targetChain, state.address]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts: unknown) => {
      const list = accounts as string[];
      if (list.length === 0) {
        setState({
          address: null,
          isConnecting: false,
          error: null,
          walletClient: null,
          chainId: null,
        });
      } else {
        setState((s) => ({ ...s, address: list[0] as `0x${string}` }));
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum!.removeListener("accountsChanged", handler);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (id: unknown) => {
      const parsed = Number(id);
      setState((s) => ({ ...s, chainId: parsed }));
    };
    window.ethereum.on("chainChanged", handler);
    return () => window.ethereum!.removeListener("chainChanged", handler);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((s) => ({ ...s, error: "No wallet detected. Install MetaMask." }));
      return;
    }
    setState((s) => ({ ...s, isConnecting: true, error: null }));
    try {
      // Request accounts
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      await refreshChainId();

      // Switch / add target chain
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChain.id.toString(16)}` }],
        });
      } catch (switchErr: unknown) {
        // 4902 = chain not added yet
        if ((switchErr as { code?: number }).code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${targetChain.id.toString(16)}`,
                chainName: targetChain.name,
                nativeCurrency: targetChain.nativeCurrency,
                rpcUrls: [targetChain.rpcUrl],
                blockExplorerUrls: [targetChain.explorerUrl],
              },
            ],
          });
        } else {
          throw switchErr;
        }
      }

      const wc = createWalletClient({
        chain: targetChain.viemChain,
        transport: custom(window.ethereum),
      });

      setState({
        address: accounts[0] as `0x${string}`,
        isConnecting: false,
        error: null,
        walletClient: wc,
        chainId: targetChain.id,
      });
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: (err as Error).message ?? "Connection failed",
      }));
    }
  }, [refreshChainId, targetChain]);

  const ensureChain = useCallback(async () => {
    if (!window.ethereum) return false;
    const currentId = (await refreshChainId()) ?? state.chainId;
    if (currentId === targetChain.id) return true;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChain.id.toString(16)}` }],
      });
      await refreshChainId();
      return true;
    } catch (switchErr: unknown) {
      if ((switchErr as { code?: number }).code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${targetChain.id.toString(16)}`,
              chainName: targetChain.name,
              nativeCurrency: targetChain.nativeCurrency,
              rpcUrls: [targetChain.rpcUrl],
              blockExplorerUrls: [targetChain.explorerUrl],
            },
          ],
        });
        await refreshChainId();
        return true;
      }
      return false;
    }
  }, [refreshChainId, state.chainId, targetChain]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnecting: false,
      error: null,
      walletClient: null,
      chainId: null,
    });
  }, []);

  return { ...state, connect, disconnect, ensureChain, refreshChainId };
}