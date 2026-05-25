// src/config/vaults.ts

import { CHAINS, type ChainConfig } from "./chains";
import { VAULT_ADDRESS, USDC_ADDRESS } from "../lib/contracts";

export type PermitConfig = {
  type: "eip2612";
  version?: string;
};

export type VaultConfig = {
  id: string;
  name: string;
  label: string;
  symbol: string;
  assetSymbol: string;
  vaultAddress: `0x${string}`;
  assetAddress: `0x${string}`;
  icon: string;
  assetIcon?: string;
  shareIcon?: string;
  chainIcon?: string;
  description: string;
  chain: ChainConfig;
  permit?: PermitConfig;
  isNew?: boolean;
  isBoosted?: boolean;
};

const BASE_USDC_VAULT =
  (import.meta.env.VITE_BASE_USDC_VAULT as `0x${string}` | undefined) ??
  "0x95800cCC8e8C257dFAa39Fd86C16588c8c0DD0c0";
const BASE_USDC_ASSET =
  (import.meta.env.VITE_BASE_USDC_ASSET as `0x${string}` | undefined) ??
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_USDT_VAULT =
  (import.meta.env.VITE_BASE_USDT_VAULT as `0x${string}` | undefined) ??
  "0xfC8b32cDcbDB1B1A1e76bE2a361e98dacBE86449";
const BASE_USDT_ASSET =
  (import.meta.env.VITE_BASE_USDT_ASSET as `0x${string}` | undefined) ??
  "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";

export const vaults: VaultConfig[] = [
  {
    id: "usdc",
    name: "USDC Vault",
    label: "USDC",
    symbol: "spx",
    assetSymbol: "USDC.e",
    vaultAddress: VAULT_ADDRESS,
    assetAddress: USDC_ADDRESS,
    icon: "/token-imgs/vault-icon-usdc.png",
    assetIcon: "/token-imgs/vault-icon-usdc.png",
    shareIcon: "/token-imgs/spx-lp-token.png",
    chainIcon: "/token-imgs/arbitrum.png",
    description: "Institutional-grade liquidity pools, secure, multi-chain.",
    chain: CHAINS.arbitrum,
    isNew: true,
    isBoosted: true,
  },
  {
    id: "usdc-base",
    name: "USDC Vault (Base)",
    label: "USDC",
    symbol: "l1USDC",
    assetSymbol: "USDC",
    vaultAddress: BASE_USDC_VAULT,
    assetAddress: BASE_USDC_ASSET,
    icon: "/token-imgs/vault-icon-usdc.png",
    assetIcon: "/token-imgs/vault-icon-usdc.png",
    shareIcon: "/token-imgs/l1.png",
    chainIcon: "/token-imgs/base.png",
    description: "Base mainnet USDC vault with ERC-4626 yield.",
    chain: CHAINS.base,
    permit: { type: "eip2612", version: "2" },
    isNew: true,
  },
  {
    id: "usdt-base",
    name: "USDT Vault (Base)",
    label: "USDT",
    symbol: "l1USDT",
    assetSymbol: "USDT",
    vaultAddress: BASE_USDT_VAULT,
    assetAddress: BASE_USDT_ASSET,
    icon: "/token-imgs/usdt.png",
    assetIcon: "/token-imgs/usdt.png",
    shareIcon: "/token-imgs/l1.png",
    chainIcon: "/token-imgs/base.png",
    description: "Base mainnet USDT vault with ERC-4626 yield.",
    chain: CHAINS.base,
    isNew: true,
  },
  // Add more vaults here as needed:
  /*
  {
    id: "eth",
    name: "ETH Vault",
    symbol: "ETH",
    assetSymbol: "WETH",
    vaultAddress: "0x...",
    assetAddress: "0x...",
    icon: "/token-imgs/vault-icon-eth.png",
    description: "Safe yield on your ETH holdings.",
    chain: CHAINS.arbitrum,
  }
  */
];

export const getVaultById = (id: string) => vaults.find(v => v.id === id);
