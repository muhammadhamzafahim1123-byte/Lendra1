import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useVaultData, formatToken } from "../hooks/useVaultData";
import { AlertCircle, ChevronRight, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { usePreloader } from "./PreloaderContext";
import { vaults, VaultConfig } from "../config/vaults";
import { getPublicClient } from "../lib/publicClient";

const VaultRow = ({ vault: config, address }: { vault: VaultConfig; address: `0x${string}` | null }) => {
  const navigate = useNavigate();
  const chainClient = getPublicClient(config.chain.viemChain, config.chain.rpcUrl);
  const { data: vault } = useVaultData(
    address ?? null,
    config.vaultAddress,
    config.assetAddress,
    chainClient,
  );

  const tvlDisplay = vault.loading
    ? "—"
    : `$${formatToken(vault.totalAssets, vault.assetDecimals, 0)}`;
  const capDisplay = vault.loading
    ? "—"
    : vault.depositCap === 0n
      ? "Unlimited"
      : `$${formatToken(vault.depositCap, vault.assetDecimals, 0)}`;

  return (
    <div 
      onClick={() => navigate(`/vault/${config.id}`)}
      className="grid grid-cols-12 gap-4 items-center bg-transparent border-b border-white/5 py-5 px-4 hover:bg-white/[0.02] cursor-pointer transition-colors group"
    >
      {/* Asset Info */}
      <div className="col-span-8 md:col-span-6 flex items-center gap-4">
        <img 
          src={config.icon} 
          alt={config.symbol} 
          className="w-10 h-10 object-contain flex-shrink-0" 
        />
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-medium text-[15px]">{config.label}</span>
            {config.chainIcon && (
              <img
                src={config.chainIcon}
                alt={config.chain.name}
                className="w-4 h-4 object-contain rounded-full opacity-80"
              />
            )}
            {config.isNew && (
              <span className="bg-[#e88147] text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">New</span>
            )}
            {config.isBoosted && (
              <span className="bg-green-500/20 text-green-300 border border-green-500/20 text-[9px] px-2 py-0.5 rounded-full font-medium">Boosted</span>
            )}
          </div>
          <div className="text-white/40 text-[12px]">{config.name}</div>
        </div>
      </div>

      {/* Shares */}
      <div className="col-span-3 md:col-span-2 hidden md:block">
        <span className="text-white font-medium text-[14px]">
          {vault.loading ? "—" : formatToken(vault.totalSupply, vault.shareDecimals, 0)}
        </span>
      </div>

      {/* TVL */}
      <div className="col-span-4 md:col-span-2">
        <span className="text-white font-medium text-[14px]">{tvlDisplay}</span>
      </div>

      {/* Deposit Cap & Chevron */}
      <div className="col-span-2 md:col-span-2 flex items-center justify-between gap-4">
        <span className="text-white text-[14px] hidden md:block">
          {capDisplay}
        </span>
        <ChevronRight size={18} className="text-white/20 group-hover:text-white transition-colors flex-shrink-0" />
      </div>
    </div>
  );
};

export const VaultsIndexPage = () => {
  const { address, connect } = useWallet();
  const { status: preloaderStatus } = usePreloader();
  const isRevealed = preloaderStatus === "done";

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-start px-4 md:px-12 lg:px-24 pt-32 pb-24 relative bg-[#020202]">
      {/* Ambient Background */}
      <div className="absolute top-0 inset-x-0 h-full w-full pointer-events-none select-none z-0">
        <div className="absolute top-[10%] left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-brand-accent/[0.04] rounded-[100%] blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[88rem] mx-auto relative z-10 flex flex-col"
      >
        {/* Page Title */}
        <div className="mb-8 px-4">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="site-ui-label text-brand-accent">Protocol Live</span>
          </div>
          <h1 className="site-section-heading mb-2">The Vault</h1>
          <p className="site-card-body max-w-xl text-white/50">
            Institutional-grade liquidity pools, secure, multi-chain.
          </p>
        </div>

        {/* Connect Banner */}
        {!address && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-green-500/[0.02] border border-green-500/10 p-4 rounded-xl mb-8 text-sm text-white/60 hover:bg-green-500/[0.04] transition-colors">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <AlertCircle size={16} className="text-green-400" />
              <span className="text-[13px]">Connect your wallet to see your deposit in each vault.</span>
            </div>
            <button 
              onClick={connect} 
              className="text-green-400 text-[13px] font-medium flex items-center gap-1 hover:text-green-300 transition-colors"
            >
              Connect Wallet <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/5 text-white/40 text-[11px] uppercase tracking-wider mb-4 px-4">
          <div className="col-span-6 md:col-span-6"></div>
          <div className="col-span-3 md:col-span-2 hidden md:block">Shares</div>
          <div className="col-span-4 md:col-span-2">TVL</div>
          <div className="col-span-2 md:col-span-2 hidden md:block">Deposit Cap</div>
        </div>


        {/* Rows */}
        <div className="flex flex-col space-y-1">
          {vaults.map((vault) => (
            <VaultRow key={vault.id} vault={vault} address={address} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
