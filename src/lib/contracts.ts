// src/lib/contracts.ts
// Central source of truth for contract addresses and ABIs

export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_PROXY as `0x${string}`;
export const USDC_ADDRESS  = import.meta.env.VITE_USDC_ADDRESS  as `0x${string}`;
export const CHAIN_ID      = Number(import.meta.env.VITE_CHAIN_ID ?? 42161);
export const RPC_URL       = import.meta.env.VITE_RPC_URL as string;

// ─── Minimal ERC-20 ABI ──────────────────────────────────────────────────────
export const ERC20_ABI = [
  {
    type: "function", name: "name",
    inputs: [], outputs: [{ type: "string" }], stateMutability: "view",
  },
  {
    type: "function", name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "allowance",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "approve",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "decimals",
    inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view",
  },
] as const;

export const ERC20_PERMIT_ABI = [
  {
    type: "function", name: "nonces",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "DOMAIN_SEPARATOR",
    inputs: [], outputs: [{ type: "bytes32" }], stateMutability: "view",
  },
  {
    type: "function", name: "version",
    inputs: [], outputs: [{ type: "string" }], stateMutability: "view",
  },
  {
    type: "function", name: "permit",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// ─── ERC-4626 Vault ABI (all user-facing + view functions) ───────────────────
export const VAULT_ABI = [
  // ── views ──
  {
    type: "function", name: "totalAssets",
    inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "totalSupply",
    inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "depositCap",
    inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "paused",
    inputs: [], outputs: [{ type: "bool" }], stateMutability: "view",
  },
  {
    type: "function", name: "asset",
    inputs: [], outputs: [{ type: "address" }], stateMutability: "view",
  },
  {
    type: "function", name: "decimals",
    inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view",
  },
  {
    type: "function", name: "previewDeposit",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "previewMint",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "previewRedeem",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "previewWithdraw",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "convertToAssets",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "maxDeposit",
    inputs: [{ name: "receiver", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "maxRedeem",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }], stateMutability: "view",
  },
  {
    type: "function", name: "version",
    inputs: [], outputs: [{ type: "string" }], stateMutability: "pure",
  },
  // ── writes ──
  {
    type: "function", name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ type: "uint256" }], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "mint",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ type: "uint256" }], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "redeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ type: "uint256" }], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ type: "uint256" }], stateMutability: "nonpayable",
  },
  {
    type: "function", name: "depositWithPermit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "deadline", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [{ type: "uint256" }], stateMutability: "nonpayable",
  },
] as const;