// Live ERC-4626 vault UI — same visual design, fully wired multi-chain

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { usePreloader } from "./PreloaderContext";
import {
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Settings,
  History,
  AlertCircle,
  Wallet,
  LogOut,
  ExternalLink,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { formatUnits } from "viem";
import { useNavigate, useParams } from "react-router-dom";
import { CHAINS } from "../config/chains";
import { getVaultById } from "../config/vaults";
import { useWallet } from "../hooks/useWallet";
import {
  useVaultData,
  formatToken,
  parseToken,
} from "../hooks/useVaultData";
import { useVaultActions } from "../hooks/useVaultActions";
import { getPublicClient } from "../lib/publicClient";
import { VAULT_ABI } from "../lib/contracts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function explorerTx(baseUrl: string, hash: string) {
  return `${baseUrl}/tx/${hash}`;
}

function explorerAddress(baseUrl: string, address: string) {
  return `${baseUrl}/address/${address}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "deposit" | "withdraw";
type LastAction = "deposit" | "mint" | "withdraw" | "redeem" | null;
type WatchStatus = "idle" | "prompted" | "added" | "failed" | "unsupported";

// ─── Component ───────────────────────────────────────────────────────────────

export const VaultPage = () => {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const vaultConfig = getVaultById(vaultId ?? "");
  const { status: preloaderStatus } = usePreloader();
  const isRevealed = preloaderStatus === "done";

  //debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Wallet
  const {
    address,
    isConnecting,
    walletClient,
    connect,
    disconnect,
    error: walletError,
    chainId,
    ensureChain,
    refreshChainId,
  } = useWallet(vaultConfig?.chain ?? CHAINS.arbitrum);

  const chainClient = getPublicClient(
    (vaultConfig?.chain ?? CHAINS.arbitrum).viemChain,
    (vaultConfig?.chain ?? CHAINS.arbitrum).rpcUrl,
  );

  // Vault data (polls every 15 s)
  const { data: vault, refetch } = useVaultData(
    address ?? null,
    vaultConfig?.vaultAddress,
    vaultConfig?.assetAddress,
    chainClient,
  );

  // Actions
  const actions = useVaultActions(
    walletClient,
    address ?? null,
    vaultConfig?.vaultAddress,
    vaultConfig?.assetAddress,
    refetch,
    chainClient,
    vaultConfig?.permit,
    vaultConfig?.chain.id,
  );

  // UI state
  const [tab, setTab] = useState<Tab>("deposit");
  const [amountMode, setAmountMode] = useState<"assets" | "shares">("assets");
  const [inputVal, setInputVal] = useState("");
  const [preview, setPreview] = useState<bigint | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastAction, setLastAction] = useState<LastAction>(null);
  const [watchStatus, setWatchStatus] = useState<WatchStatus>("idle");
  const watchPromptedRef = useRef(false);

  useEffect(() => {
    if (!vaultConfig || !address || !chainId) return;
    if (chainId !== vaultConfig.chain.id) {
      refreshChainId();
    }
  }, [address, chainId, refreshChainId, vaultConfig]);

  useEffect(() => {
    watchPromptedRef.current = false;
    setWatchStatus("idle");
  }, [vaultConfig?.id]);

  useEffect(() => {
    if (!vaultConfig) return;
    if (actions.status !== "success") return;
    if (watchPromptedRef.current) return;
    if (lastAction !== "deposit" && lastAction !== "mint") return;

    const ethereum = window.ethereum;
    if (!ethereum?.request || !vaultConfig.shareIcon) {
      setWatchStatus("unsupported");
      return;
    }

    const imageUrl = new URL(vaultConfig.shareIcon, window.location.origin).href;
    setWatchStatus("prompted");
    ethereum
      .request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: vaultConfig.vaultAddress,
            symbol: vaultConfig.symbol,
            decimals: vault.shareDecimals,
            image: imageUrl,
          },
        },
      })
      .then((added) => {
        setWatchStatus(added ? "added" : "failed");
      })
      .catch(() => {
        setWatchStatus("failed");
      });

    watchPromptedRef.current = true;
  }, [actions.status, lastAction, vaultConfig, vault.shareDecimals]);

  if (!vaultConfig) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#020202] text-white px-6">
        <h2 className="text-2xl font-bold mb-4">Vault not found</h2>
        <button 
          onClick={() => navigate("/vault")}
          className="text-brand-accent hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Vaults
        </button>
      </div>
    );
  }

  // ── Preview debounce ───────────────────────────────────────────────────────
  const fetchPreview = useCallback(
    async (val: string, currentTab: Tab, currentMode: "assets" | "shares") => {
      if (!vaultConfig) return;
      if (!val || isNaN(Number(val)) || Number(val) <= 0) {
        setPreview(null);
        return;
      }
      setPreviewLoading(true);
      try {
        if (currentTab === "deposit") {
          if (currentMode === "assets") {
            const raw = parseToken(val, vault.assetDecimals);
            const shares = await chainClient.readContract({
              address: vaultConfig.vaultAddress,
              abi: VAULT_ABI,
              functionName: "previewDeposit",
              args: [raw],
            });
            setPreview(shares as bigint);
          } else {
            const rawShares = parseToken(val, vault.shareDecimals);
            const assets = await chainClient.readContract({
              address: vaultConfig.vaultAddress,
              abi: VAULT_ABI,
              functionName: "previewMint",
              args: [rawShares],
            });
            setPreview(assets as bigint);
          }
        } else {
          if (currentMode === "shares") {
            const rawShares = parseToken(val, vault.shareDecimals);
            const assets = await chainClient.readContract({
              address: vaultConfig.vaultAddress,
              abi: VAULT_ABI,
              functionName: "previewRedeem",
              args: [rawShares],
            });
            setPreview(assets as bigint);
          } else {
            const raw = parseToken(val, vault.assetDecimals);
            const shares = await chainClient.readContract({
              address: vaultConfig.vaultAddress,
              abi: VAULT_ABI,
              functionName: "previewWithdraw",
              args: [raw],
            });
            setPreview(shares as bigint);
          }
        }
      } catch {
        setPreview(null);
      }
      setPreviewLoading(false);
    },
    [chainClient, vault.assetDecimals, vault.shareDecimals, vaultConfig],
  );

  function handleInput(val: string) {
    setInputVal(val);
    setPreview(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      debounceRef.current = setTimeout(
        () => fetchPreview(val, tab, amountMode),
        400,
      );
    }
  }

  function handleTabSwitch(t: Tab) {
    setTab(t);
    setAmountMode(t === "deposit" ? "assets" : "shares");
    setInputVal("");
    setPreview(null);
    actions.reset();
  }

  function handleModeSwitch(mode: "assets" | "shares") {
    setAmountMode(mode);
    setInputVal("");
    setPreview(null);
    actions.reset();
  }

  async function handleMaxClick() {
    if (!vaultConfig) return;
    if (tab === "deposit") {
      if (amountMode === "assets") {
        if (vault.userUsdcBalance <= 0n) {
          setInputVal("");
          setPreview(null);
          return;
        }
        const nextVal = formatUnits(vault.userUsdcBalance, vault.assetDecimals);
        setInputVal(nextVal);
        fetchPreview(nextVal, tab, amountMode);
      } else {
        if (vault.userUsdcBalance <= 0n) {
          setInputVal("");
          setPreview(null);
          return;
        }
        const maxShares = await chainClient.readContract({
          address: vaultConfig.vaultAddress,
          abi: VAULT_ABI,
          functionName: "previewDeposit",
          args: [vault.userUsdcBalance],
        });
        const nextVal = formatUnits(maxShares as bigint, vault.shareDecimals);
        setInputVal(nextVal);
        fetchPreview(nextVal, tab, amountMode);
      }
    } else {
      if (amountMode === "shares") {
        if (vault.userShares <= 0n) {
          setInputVal("");
          setPreview(null);
          return;
        }
        const nextVal = formatUnits(vault.userShares, vault.shareDecimals);
        setInputVal(nextVal);
        fetchPreview(nextVal, tab, amountMode);
      } else {
        if (vault.userShares <= 0n) {
          setInputVal("");
          setPreview(null);
          return;
        }
        const maxAssets = await chainClient.readContract({
          address: vaultConfig.vaultAddress,
          abi: VAULT_ABI,
          functionName: "previewRedeem",
          args: [vault.userShares],
        });
        const nextVal = formatUnits(maxAssets as bigint, vault.assetDecimals);
        setInputVal(nextVal);
        fetchPreview(nextVal, tab, amountMode);
      }
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!address || !inputVal) return;
    const ok = await ensureChain();
    if (!ok) return;
    actions.reset();
    const rawAssets = parseToken(inputVal, vault.assetDecimals);
    const rawShares = parseToken(inputVal, vault.shareDecimals);
    if (tab === "deposit") {
      if (amountMode === "assets") {
        setLastAction("deposit");
        await actions.deposit(rawAssets, vault.userUsdcAllowance);
      } else {
        setLastAction("mint");
        await actions.mint(rawShares, vault.userUsdcAllowance);
      }
    } else {
      if (amountMode === "assets") {
        setLastAction("withdraw");
        await actions.withdraw(rawAssets);
      } else {
        setLastAction("redeem");
        await actions.redeem(rawShares);
      }
    }
    setInputVal("");
    setPreview(null);
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const tvlDisplay = `$${formatToken(vault.totalAssets, vault.assetDecimals, 2)}`;
  const capDisplay =
    vault.depositCap === 0n
      ? "Unlimited"
      : `$${formatToken(vault.depositCap, vault.assetDecimals, 0)}`;
  const userUsdcDisp = formatToken(vault.userUsdcBalance, vault.assetDecimals, 2);
  const userShareDisp = formatToken(vault.userShares, vault.shareDecimals, 4);

  // ── Validation ────────────────────────────────────────────────────────────────
  const inputNum = Number(inputVal);
  const rawAssets = parseToken(inputVal, vault.assetDecimals);
  const rawShares = parseToken(inputVal, vault.shareDecimals);
  const inputIsAssets = amountMode === "assets";
  const outputIsAssets = !inputIsAssets;
  const previewAssets = outputIsAssets ? preview : null;
  const previewShares = outputIsAssets ? null : preview;

  // const MIN_ETH_GAS = 500000000000000n; // 0.0005 ETH
  // const hasEnoughEth = vault.userEthBalance >= MIN_ETH_GAS;

  const validationError: string | null = (() => {
    if (!address) return null; // not connected, button just says connect
    if (chainId && chainId !== vaultConfig.chain.id)
      return `Wrong network. Switch to ${vaultConfig.chain.name}.`;

    //   if (address && !hasEnoughEth)
    // return "Insufficient ETH for gas fees. You need at least 0.0005 ETH.";

    if (!inputVal || inputNum <= 0) return null; // empty, no error yet

    if (tab === "deposit") {
      if (inputIsAssets) {
        if (rawAssets > vault.userUsdcBalance)
          return `Insufficient ${vaultConfig.assetSymbol} balance. You have ${userUsdcDisp} ${vaultConfig.assetSymbol}.`;
        if (
          vault.depositCap > 0n &&
          vault.totalAssets + rawAssets > vault.depositCap
        )
          return `Deposit would exceed vault cap of ${capDisplay}.`;
        if (rawAssets === 0n) return "Amount too small.";
      } else {
        if (rawShares === 0n) return "Amount too small.";
        if (previewAssets !== null && previewAssets > vault.userUsdcBalance)
          return `Insufficient ${vaultConfig.assetSymbol} balance. You have ${userUsdcDisp} ${vaultConfig.assetSymbol}.`;
        if (
          previewAssets !== null &&
          vault.depositCap > 0n &&
          vault.totalAssets + previewAssets > vault.depositCap
        )
          return `Deposit would exceed vault cap of ${capDisplay}.`;
      }
    }

    if (tab === "withdraw") {
      if (inputIsAssets) {
        if (rawAssets === 0n) return "Amount too small.";
        if (previewShares !== null && previewShares > vault.userShares)
          return `Insufficient ${vaultConfig.symbol} balance. You have ${userShareDisp} ${vaultConfig.symbol}.`;
      } else {
        if (rawShares > vault.userShares)
          return `Insufficient ${vaultConfig.symbol} balance. You have ${userShareDisp} ${vaultConfig.symbol}.`;
        if (rawShares === 0n) return "Amount too small.";
      }
    }

    return null;
  })();

  // Exchange rate: 1 asset = X shares (uses current ratios if funded)
  const defaultRate = Math.pow(10, vault.shareDecimals - vault.assetDecimals);
  const assetToShareRate =
    vault.totalAssets > 0n && vault.totalSupply > 0n
      ? (Number(vault.totalSupply) / Number(vault.totalAssets)).toFixed(3)
      : defaultRate.toFixed(3);
  const shareToAssetRate =
    vault.totalAssets > 0n && vault.totalSupply > 0n
      ? (Number(vault.totalAssets) / Number(vault.totalSupply)).toFixed(6)
      : (1 / defaultRate).toFixed(6);

  // Button text
  const isBusy = [
    "signing",
    "approving",
    "depositing",
    "minting",
    "withdrawing",
    "redeeming",
  ].includes(actions.status);
  let btnLabel = address
    ? tab === "deposit"
      ? inputIsAssets
        ? "Deposit"
        : "Mint Shares"
      : inputIsAssets
        ? "Withdraw"
        : "Redeem Shares"
    : "Connect Wallet";
  if (actions.status === "signing") btnLabel = "Signing permit…";
  if (actions.status === "approving")
    btnLabel = `Approving ${vaultConfig.assetSymbol}…`;
  if (actions.status === "depositing") btnLabel = "Depositing…";
  if (actions.status === "minting") btnLabel = "Minting…";
  if (actions.status === "withdrawing") btnLabel = "Withdrawing…";
  if (actions.status === "redeeming") btnLabel = "Redeeming…";

  // Input label & balance shortcut
  const inputLabel = (() => {
    if (tab === "deposit")
      return inputIsAssets
        ? `You Pay (${vaultConfig.assetSymbol})`
        : `Shares to Mint (${vaultConfig.symbol})`;
    return inputIsAssets
      ? `You Receive (${vaultConfig.assetSymbol})`
      : `Shares to Burn (${vaultConfig.symbol})`;
  })();
  const outputLabel = (() => {
    if (tab === "deposit")
      return inputIsAssets
        ? `You Receive (${vaultConfig.symbol})`
        : `You Pay (${vaultConfig.assetSymbol})`;
    return inputIsAssets
      ? `Shares to Burn (${vaultConfig.symbol})`
      : `You Receive (${vaultConfig.assetSymbol})`;
  })();
  const balanceLabel =
    tab === "deposit"
      ? `Bal: ${userUsdcDisp} ${vaultConfig.assetSymbol}`
      : `Bal: ${userShareDisp} ${vaultConfig.symbol}`;

  const previewDisplay =
    preview !== null
      ? outputIsAssets
        ? formatToken(preview, vault.assetDecimals, 2)
        : formatToken(preview, vault.shareDecimals, 4)
      : "";

  const canShowManualAdd = watchStatus === "failed" || watchStatus === "unsupported";
  const shareTokenAddress = vaultConfig.vaultAddress;
  const shareTokenDecimals = vault.shareDecimals;

  function handleCopyShareAddress() {
    navigator.clipboard?.writeText(shareTokenAddress).catch(() => {});
  }

  // ── Animation variants ─────────────────────────────────────────────────────
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };
  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-start px-4 md:px-12 lg:px-24 pt-32 pb-24 relative overflow-x-hidden overflow-y-auto bg-[#020202]">
      {/* Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-full w-full pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-brand-accent/[0.04] rounded-[100%] blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] bg-green-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isRevealed ? "visible" : "hidden"}
        className="w-full max-w-[88rem] mx-auto relative z-10 flex flex-col"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-end border-b border-white/10 pb-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-2 text-white/30 text-[11px] uppercase tracking-wider mb-8">
              <span 
                onClick={() => navigate("/vault")}
                className="hover:text-white/60 cursor-pointer transition-colors"
              >
                Vaults
              </span>
              <span className="text-white/10">/</span>
              <span className="text-white/60">{vaultConfig.name}</span>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <img 
                src={vaultConfig.icon} 
                alt={vaultConfig.symbol} 
                className="w-10 h-10 object-contain" 
              />
              <h1 className="text-[2.25rem] font-bold text-white">{vaultConfig.name}</h1>
            </div>
            <p className="site-card-body max-w-xl text-white/50">
              {vaultConfig.description}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {address ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <span className="text-[11px] text-green-200/80 font-medium">
                    {shortAddr(address)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-colors"
                  title="Disconnect"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/70 hover:bg-white/10 transition-all"
              >
                {isConnecting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Wallet size={13} />
                )}
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </motion.div>

        {/* Wallet / chain error banner */}
        {walletError && (
          <motion.div
            variants={itemVariants}
            className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-xs text-red-300"
          >
            <AlertCircle size={13} />
            <span>
              {walletError}
              {walletError.toLowerCase().includes("no wallet detected") && (
                <>
                  {" "}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline inline-flex items-center gap-1 text-red-200 hover:text-red-100"
                  >
                    Get MetaMask <ExternalLink size={10} />
                  </a>
                </>
              )}
            </span>
          </motion.div>
        )}

        {/* Paused banner */}
        {vault.paused && (
          <motion.div
            variants={itemVariants}
            className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-xs text-red-300"
          >
            <AlertCircle size={13} />
            Vault is currently paused by owner. Deposits and withdrawals are
            disabled.
          </motion.div>
        )}

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          {/* ── Left: Metrics ── */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Primary stat card */}
            <motion.div
              variants={itemVariants}
              className="bg-white/[0.02] border border-white/[0.05] p-6 lg:p-8 rounded-3xl backdrop-blur-3xl relative overflow-hidden flex-1 flex flex-col justify-center"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-green-400/[0.03] rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="site-ui-label text-white/50">Vault Overview</h2>
                <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  {vaultConfig.chainIcon && (
                    <img
                      src={vaultConfig.chainIcon}
                      alt={vaultConfig.chain.name}
                      className="w-3.5 h-3.5 object-contain rounded-full"
                    />
                  )}
                  <span className="site-ui-label text-green-400">
                    Live · {vaultConfig.chain.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 md:gap-8 relative z-10">
                <div>
                  <p className="site-metric-value mb-1">
                    {vault.loading ? "—" : tvlDisplay}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
                    <TrendingUp size={12} className="text-green-400" /> TVL
                    ({vaultConfig.assetSymbol})
                  </p>
                </div>
                <div>
                  <p className="site-metric-value mb-1 text-brand-accent">
                    {vault.loading ? "—" : capDisplay}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
                    <Zap size={12} className="text-yellow-400" /> Deposit Cap
                  </p>
                </div>
                <div>
                  <p className="site-metric-value mb-1">
                    {vault.loading
                      ? "—"
                      : formatToken(vault.totalSupply, vault.shareDecimals, 0)}
                  </p>
                  <p className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
                    <TrendingUp size={12} className="text-blue-400" /> Shares
                    ({vaultConfig.symbol})
                  </p>
                </div>
              </div>

              {/* User position (only when connected and has shares) */}
              {address && vault.userShares > 0n && (
                <div className="mt-6 pt-5 border-t border-white/5 relative z-10 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/80 text-lg font-semibold truncate">
                      {formatToken(vault.userShares, vault.shareDecimals, 4)}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Your {vaultConfig.symbol}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-lg font-semibold truncate">
                      {vault.loading
                        ? "0.00"
                        : formatToken(vault.userUsdcBalance, vault.assetDecimals, 2)} {vaultConfig.assetSymbol}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Wallet balance
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-lg font-semibold truncate">
                      {formatToken(vault.totalSupply, vault.shareDecimals, 4)}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Total {vaultConfig.symbol} supply
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-3xl"
              >
                <ShieldCheck className="text-white/60 mb-3" size={18} />
                <h3 className="site-ui-label mb-2 text-white/50">
                  Institutional Guard
                </h3>
                <p className="site-card-body text-white/40">
                  Multi-sig custody with automated risk circuit breakers.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-3xl"
              >
                <ArrowLeftRight className="text-white/60 mb-3" size={18} />
                <h3 className="site-ui-label mb-2 text-white/50">
                  Liquid Exits
                </h3>
                <p className="site-card-body text-white/40">
                  Redeem your LP whenever you want, small lockup period.
                </p>
              </motion.div>
            </div>
          </div>

          {/* ── Right: Swap panel ── */}
          <motion.div variants={itemVariants} className="lg:col-span-5 h-full">
            <div className="bg-[#0a0a0a] border border-white/10 p-1.5 rounded-[2rem] shadow-2xl h-full flex flex-col relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/[0.04] blur-[40px]" />

              <div className="p-5 flex-1 flex flex-col relative z-10 justify-between">
                {/* Panel header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-xl">
                      <button
                        onClick={() => handleTabSwitch("deposit")}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tab === "deposit" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
                      >
                        Deposit
                      </button>
                      <button
                        onClick={() => handleTabSwitch("withdraw")}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tab === "withdraw" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-white/40">
                    <History
                      size={14}
                      className="cursor-pointer hover:text-white"
                    />
                    <Settings
                      size={14}
                      className="cursor-pointer hover:text-white"
                      onClick={() => setSettingsOpen((p) => !p)}
                    />
                  </div>
                </div>

                {/* Settings mini panel */}
                {settingsOpen && (
                  <div className="mb-4 bg-white/[0.02] border border-white/5 p-3 rounded-2xl text-[11px] text-white/50 space-y-1">
                    <div className="flex justify-between">
                      <span>Network</span>
                      <span className="text-white/70">{vaultConfig.chain.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contract</span>
                      <a
                        href={explorerAddress(
                          vaultConfig.chain.explorerUrl,
                          vaultConfig.vaultAddress,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-accent flex items-center gap-1 hover:underline"
                      >
                        {shortAddr(vaultConfig.vaultAddress)} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span>TVL</span>
                      <span className="text-white/70">{tvlDisplay}</span>
                    </div>
                  </div>
                )}

                {tab === "deposit" && amountMode === "shares" && vaultConfig.permit && (
                  <div className="mb-4 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-[11px] text-blue-200">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Tip: You can save gas by depositing instead of minting when permit is supported.
                    </span>
                  </div>
                )}

                <div className="space-y-1 relative">
                  {/* Input field */}
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="site-ui-label text-white/40">
                        {inputLabel}
                      </span>
                      <button
                        className="site-ui-label cursor-pointer text-white/40 hover:text-white"
                        onClick={handleMaxClick}
                      >
                        {balanceLabel}
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <input
                        type="number"
                        value={inputVal}
                        onChange={(e) => handleInput(e.target.value)}
                        placeholder="0.0"
                        min="0"
                        className="bg-transparent border-none outline-none text-2xl font-medium w-full placeholder:text-white/10"
                      />
                      {inputIsAssets ? (
                        <button className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5 flex-shrink-0">
                          <img 
                            src={vaultConfig.assetIcon} 
                            alt={vaultConfig.assetSymbol} 
                            className="w-6 h-6 object-contain" 
                          />
                          <span className="font-medium text-xs">{vaultConfig.assetSymbol}</span>
                        </button>
                      ) : (
                        <button className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5 flex-shrink-0">
                          <img 
                            src={vaultConfig.shareIcon} 
                            alt={vaultConfig.symbol} 
                            className="w-6 h-6 object-contain brightness-110" 
                          />
                          <span className="font-medium text-xs">{vaultConfig.symbol}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arrow divider */}
                  <div className="flex justify-center -my-3 relative z-10">
                    <button
                      type="button"
                      onClick={() =>
                        handleModeSwitch(
                          amountMode === "assets" ? "shares" : "assets",
                        )
                      }
                      className="bg-[#050505] border border-white/10 p-1.5 rounded-xl text-white/40 shadow-lg hover:text-white transition-colors"
                      title="Switch amount mode"
                    >
                      <ArrowLeftRight size={14} className="rotate-90" />
                    </button>
                  </div>

                  {/* Output field */}
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="site-ui-label text-white/40">
                        {outputLabel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-2xl font-medium ${previewDisplay ? "text-white" : "text-white/10"}`}
                      >
                        {previewLoading ? (
                          <Loader2
                            size={20}
                            className="animate-spin text-white/30"
                          />
                        ) : (
                          previewDisplay || "0.0"
                        )}
                      </p>
                      {outputIsAssets ? (
                        <button className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5 flex-shrink-0">
                          <img 
                            src={vaultConfig.assetIcon} 
                            alt={vaultConfig.assetSymbol} 
                            className="w-6 h-6 object-contain" 
                          />
                          <span className="font-medium text-xs">{vaultConfig.assetSymbol}</span>
                        </button>
                      ) : (
                        <button className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5 flex-shrink-0">
                          <img 
                            src={vaultConfig.shareIcon} 
                            alt={vaultConfig.symbol} 
                            className="w-6 h-6 object-contain brightness-110" 
                          />
                          <span className="font-medium text-xs">{vaultConfig.symbol}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rate info */}
                <div className="mt-4 px-2 space-y-2 mb-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40 font-light">
                      Exchange Rate
                    </span>
                    <span className="font-medium text-white/80">
                      1 {vaultConfig.assetSymbol} = {assetToShareRate} {vaultConfig.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40 font-light">
                      Redeem Rate
                    </span>
                    <span className="font-medium text-white/80">
                      1 {vaultConfig.symbol} = {shareToAssetRate} {vaultConfig.assetSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40 font-light">Vault Cap</span>
                    <span className="text-green-400 font-medium">
                      {capDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40 font-light">Contract</span>
                    <a
                      href={explorerAddress(
                        vaultConfig.chain.explorerUrl,
                        vaultConfig.vaultAddress,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-accent flex items-center gap-1 hover:underline font-medium"
                    >
                      {shortAddr(vaultConfig.vaultAddress)} <ExternalLink size={9} />
                    </a>
                  </div>
                </div>

                {/* Validation error */}
                {validationError && (
                  <div className="mb-3 flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-xl text-[11px] text-yellow-300">
                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Error display */}
                {actions.error && (
                  <div className="mb-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl text-[11px] text-red-300">
                    <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                    <span className="break-all">{actions.error}</span>
                  </div>
                )}

                {/* Success display */}
                {actions.status === "success" && actions.txHash && (
                  <div className="mb-3 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl text-[11px] text-green-300">
                    <CheckCircle size={12} className="flex-shrink-0" />
                    <span>Success! </span>
                    <a
                      href={explorerTx(vaultConfig.chain.explorerUrl, actions.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="underline flex items-center gap-0.5"
                    >
                      View tx <ExternalLink size={9} />
                    </a>
                  </div>
                )}

                {actions.status === "success" && canShowManualAdd && (
                  <div className="mb-3 flex flex-col gap-2 bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-[11px] text-white/60">
                    <div className="flex items-center justify-between">
                      <span>Add {vaultConfig.symbol} to your wallet</span>
                      <button
                        onClick={handleCopyShareAddress}
                        className="text-brand-accent hover:underline"
                      >
                        Copy address
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Address</span>
                      <span className="text-white/70">{shortAddr(shareTokenAddress)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40">Decimals</span>
                      <span className="text-white/70">{shareTokenDecimals}</span>
                    </div>
                  </div>
                )}

                {/* Two-tx warning — only on first deposit when no allowance
                {tab === "deposit" && address && vault.userUsdcAllowance === 0n && inputNum > 0 && !validationError && (
                <div className="mb-3 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-[11px] text-blue-300">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>First deposit requires 2 transactions: approve {vaultConfig.assetSymbol}, then deposit or mint.</span>
                </div>
                )} */}

                {/* CTA button */}
                <button
                  onClick={address ? handleSubmit : connect}
                  disabled={
                    isBusy ||
                    vault.paused ||
                    !!validationError ||
                    (!!address && (!inputVal || inputNum <= 0))
                  }
                  className="w-full py-3.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-brand-accent transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBusy && <Loader2 size={15} className="animate-spin" />}
                  {btnLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
