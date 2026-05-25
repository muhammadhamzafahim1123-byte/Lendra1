import type { Chain } from "viem/chains";
import { arbitrum, base } from "viem/chains";
import { RPC_URL } from "../lib/contracts";

export type ChainConfig = {
  id: number;
  name: string;
  viemChain: Chain;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

const BASE_RPC_URL =
  import.meta.env.VITE_BASE_RPC_URL ?? "https://base-rpc.publicnode.com";

export const CHAINS = {
  arbitrum: {
    id: arbitrum.id,
    name: "Arbitrum One",
    viemChain: arbitrum,
    rpcUrl: RPC_URL,
    explorerUrl: "https://arbiscan.io",
    nativeCurrency: arbitrum.nativeCurrency,
  },
  base: {
    id: base.id,
    name: "Base",
    viemChain: base,
    rpcUrl: BASE_RPC_URL,
    explorerUrl: "https://basescan.org",
    nativeCurrency: base.nativeCurrency,
  },
} satisfies Record<string, ChainConfig>;
