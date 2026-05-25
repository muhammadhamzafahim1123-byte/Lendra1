// src/lib/publicClient.ts
// Read-only viem clients per chain (cached)

import { createPublicClient, http, type PublicClient } from "viem";
import type { Chain } from "viem/chains";
import { arbitrum } from "viem/chains";
import { RPC_URL } from "./contracts";

const clientCache = new Map<string, PublicClient>();

export function getPublicClient(chain: Chain, rpcUrl: string): PublicClient {
  const key = `${chain.id}:${rpcUrl}`;
  const existing = clientCache.get(key);
  if (existing) return existing;

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  clientCache.set(key, client);
  return client;
}

export const publicClient = getPublicClient(arbitrum, RPC_URL);