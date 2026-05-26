import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { motion } from "motion/react";
import { usePreloader } from "./PreloaderContext";
import { vaults } from "../config/vaults";
import { VaultButton } from "./VaultButton";

type Allocation = { name: string; percent: number; color: string };
type AllocationProfile = "conservative" | "balanced" | "aggressive";

const allocationColors: Record<string, string> = {
  "Ondo BUIDL": "#4BFFB3",
  "Hashnote USYC": "#C9FFE8",
  "USDC reserve": "#83D8B4",
  "Maple Finance": "#37B887",
  Clearpool: "#267A60",
  Goldfinch: "#1B5948",
  Centrifuge: "#12392F",
  "Partner network": "#0A211C",
};

const allocationSets: Record<AllocationProfile, Allocation[]> = {
  conservative: [
    { name: "Ondo BUIDL", percent: 35, color: allocationColors["Ondo BUIDL"] },
    { name: "Hashnote USYC", percent: 20, color: allocationColors["Hashnote USYC"] },
    { name: "USDC reserve", percent: 15, color: allocationColors["USDC reserve"] },
    { name: "Maple Finance", percent: 12, color: allocationColors["Maple Finance"] },
    { name: "Clearpool", percent: 9.5, color: allocationColors.Clearpool },
    { name: "Goldfinch", percent: 5, color: allocationColors.Goldfinch },
    { name: "Centrifuge", percent: 2, color: allocationColors.Centrifuge },
    { name: "Partner network", percent: 1.5, color: allocationColors["Partner network"] },
  ],
  balanced: [
    { name: "Ondo BUIDL", percent: 27.4, color: allocationColors["Ondo BUIDL"] },
    { name: "Clearpool", percent: 18.7, color: allocationColors.Clearpool },
    { name: "Maple Finance", percent: 18.3, color: allocationColors["Maple Finance"] },
    { name: "Hashnote USYC", percent: 14.2, color: allocationColors["Hashnote USYC"] },
    { name: "Goldfinch", percent: 8.1, color: allocationColors.Goldfinch },
    { name: "USDC reserve", percent: 7.6, color: allocationColors["USDC reserve"] },
    { name: "Centrifuge", percent: 7.1, color: allocationColors.Centrifuge },
    { name: "Partner network", percent: 6.6, color: allocationColors["Partner network"] },
  ],
  aggressive: [
    { name: "Goldfinch", percent: 26, color: allocationColors.Goldfinch },
    { name: "Maple Finance", percent: 22, color: allocationColors["Maple Finance"] },
    { name: "Clearpool", percent: 18, color: allocationColors.Clearpool },
    { name: "Partner network", percent: 14, color: allocationColors["Partner network"] },
    { name: "Centrifuge", percent: 10, color: allocationColors.Centrifuge },
    { name: "Ondo BUIDL", percent: 6, color: allocationColors["Ondo BUIDL"] },
    { name: "Hashnote USYC", percent: 3, color: allocationColors["Hashnote USYC"] },
    { name: "USDC reserve", percent: 1, color: allocationColors["USDC reserve"] },
  ],
};

const riskLabel = (value: number) =>
  value < 20 ? "Conservative" : value < 45 ? "Balanced" : value < 70 ? "Moderate" : "Aggressive";

const liquidityLabel = (value: number) =>
  value < 20 ? "Instant exit" : value < 45 ? "3-day exit" : value < 70 ? "7-day exit" : "30-day flex";

const projectedApr = (risk: number, liquidity: number) =>
  Math.round((5.2 + (risk / 100) * 10.5 + (liquidity / 100) * 1.8) * 10) / 10;

const allocationOrder = [
  "Ondo BUIDL",
  "Clearpool",
  "Maple Finance",
  "Hashnote USYC",
  "Goldfinch",
  "USDC reserve",
  "Centrifuge",
  "Partner network",
] as const;

const getProfilePercent = (profile: AllocationProfile, name: string) =>
  allocationSets[profile].find((allocation) => allocation.name === name)?.percent ?? 0;

const getInterpolatedAllocations = (risk: number): Allocation[] => {
  const fromProfile: AllocationProfile = risk < 50 ? "conservative" : "balanced";
  const toProfile: AllocationProfile = risk < 50 ? "balanced" : "aggressive";
  const t = risk < 50 ? risk / 50 : (risk - 50) / 50;

  return allocationOrder.map((name) => {
    const from = getProfilePercent(fromProfile, name);
    const to = getProfilePercent(toProfile, name);
    return {
      name,
      percent: Math.round((from + (to - from) * t) * 10) / 10,
      color: allocationColors[name],
    };
  });
};

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const describeRingSegment = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) => {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
};

const DonutChart = ({
  allocations,
  activeName,
  onActiveChange,
}: {
  allocations: Allocation[];
  activeName: string | null;
  onActiveChange: (allocation: Allocation | null) => void;
}) => {
  const [displayed, setDisplayed] = useState(allocations);

  useEffect(() => {
    const from = displayed;
    const start = performance.now();
    const duration = 520;
    let frameId = 0;

    const tick = (time: number) => {
      const t = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(
        allocations.map((target) => {
          const source = from.find((item) => item.name === target.name);
          const startPercent = source?.percent ?? 0;
          return {
            ...target,
            percent: startPercent + (target.percent - startPercent) * eased,
          };
        }),
      );

      if (t < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [allocations]);

  const totalPercent = Math.max(
    displayed.reduce((sum, allocation) => sum + allocation.percent, 0),
    1,
  );
  let angle = 0;
  const segments = displayed.map((allocation) => {
    const startAngle = angle;
    angle += (allocation.percent / totalPercent) * 360;
    return { ...allocation, startAngle, endAngle: angle };
  });

  return (
    <div className="vault-sim-donut-wrap">
      <svg className="vault-sim-donut-svg" viewBox="0 0 240 240" role="img" aria-label="Portfolio allocation">
        <circle cx="120" cy="120" r="78" className="vault-sim-donut-track" />
        {segments.map((segment) => (
          <path
            key={segment.name}
            d={describeRingSegment(
              120,
              120,
              92,
              48,
              Math.max(-0.2, segment.startAngle - 0.14),
              Math.min(360.2, Math.max(segment.endAngle + 0.14, segment.startAngle + 0.1)),
            )}
            fill={segment.color}
            className={`vault-sim-donut-segment ${activeName === segment.name ? "is-active" : ""}`}
            onMouseEnter={() => onActiveChange(segment)}
            onFocus={() => onActiveChange(segment)}
            onMouseLeave={() => onActiveChange(null)}
          />
        ))}
        <circle cx="120" cy="120" r="43" className="vault-sim-donut-hole" />
      </svg>
    </div>
  );
};

const VaultSimulator = () => {
  const navigate = useNavigate();
  const [risk, setRisk] = useState(45);
  const [liquidity, setLiquidity] = useState(50);
  const [jurisdiction, setJurisdiction] = useState("United States");
  const [isJurisdictionOpen, setIsJurisdictionOpen] = useState(false);
  const [deposit, setDeposit] = useState(10000);
  const [activeAllocation, setActiveAllocation] = useState<Allocation | null>(null);

  const allocations = useMemo(() => getInterpolatedAllocations(risk), [risk]);
  const highlightedAllocation = activeAllocation ?? allocations[0];
  const apr = projectedApr(risk, liquidity);
  const monthlyYield = Math.round((Math.max(deposit, 0) * apr) / 100 / 12);
  const jurisdictions = [
    { flagClass: "flag-us", name: "United States" },
    { flagClass: "flag-uk", name: "United Kingdom" },
    { flagClass: "flag-ae", name: "United Arab Emirates" },
    { flagClass: "flag-pk", name: "Pakistan" },
    { flagClass: "flag-other", name: "Other" },
  ];
  const selectedJurisdiction = jurisdictions.find((item) => item.name === jurisdiction) ?? jurisdictions[0];

  return (
    <section className="relative border-t border-white/8 px-4 py-20 md:px-12 md:py-24 lg:px-24">
      <div className="mx-auto max-w-[88rem]">
        <div className="mb-10 max-w-[48rem]">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-[#4BFFB3]/70" />
            <span className="site-kicker text-[#4BFFB3]">Try it</span>
          </div>
          <h2 className="font-display text-[2.6rem] font-semibold leading-tight text-white md:text-[4rem]">
            Compose your portfolio in real time.
          </h2>
          <p className="site-body mt-5 max-w-[42rem] text-white/55">
            Move the sliders. Watch the AI committee recompose your allocation, projected yield, and rationale live.
          </p>
        </div>

        <div className="overflow-visible border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.018))] shadow-[0_32px_120px_rgba(0,0,0,0.34)] backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <span className="text-[1rem] font-semibold text-white">Vault simulator</span>
              <span className="ml-2 text-xs text-white/42">preview · no funds deployed</span>
            </div>
            <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#4BFFB3]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4BFFB3] shadow-[0_0_12px_rgba(75,255,179,0.7)]" />
              Committee Live
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.46fr_0.54fr]">
            <div className="border-b border-white/10 bg-black/18 p-6 lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
              <div className="vault-sim-field">
                <div className="vault-sim-field-head">
                  <span>Risk tolerance</span>
                  <strong>{riskLabel(risk)}</strong>
                </div>
                <input className="vault-sim-range" type="range" min="0" max="100" value={risk} onChange={(event) => setRisk(Number(event.target.value))} />
                <div className="vault-sim-ends"><span>Conservative</span><span>Aggressive</span></div>
              </div>

              <div className="vault-sim-field">
                <div className="vault-sim-field-head">
                  <span>Liquidity preference</span>
                  <strong>{liquidityLabel(liquidity)}</strong>
                </div>
                <input className="vault-sim-range" type="range" min="0" max="100" value={liquidity} onChange={(event) => setLiquidity(Number(event.target.value))} />
                <div className="vault-sim-ends"><span>Instant</span><span>30-day flex</span></div>
              </div>

              <div className="vault-sim-field">
                <div className="vault-sim-field-head">
                  <span>Tax jurisdiction</span>
                  <strong>{jurisdiction}</strong>
                </div>
                <div className="vault-sim-select-wrap">
                  <button
                    type="button"
                    className="vault-sim-select"
                    onClick={() => setIsJurisdictionOpen((open) => !open)}
                    aria-expanded={isJurisdictionOpen}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`vault-country-flag ${selectedJurisdiction.flagClass}`} />
                      {jurisdiction}
                    </span>
                    <span>⌄</span>
                  </button>
                  {isJurisdictionOpen ? (
                    <div className="vault-sim-select-menu">
                      {jurisdictions.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          className={item.name === jurisdiction ? "is-active" : ""}
                          onClick={() => {
                            setJurisdiction(item.name);
                            setIsJurisdictionOpen(false);
                          }}
                        >
                          <span className={`vault-country-flag ${item.flagClass}`} />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="vault-sim-field">
                <div className="vault-sim-field-head">
                  <span>Deposit amount</span>
                  <strong>USDC</strong>
                </div>
                <div className="vault-sim-deposit">
                  <span>$</span>
                  <input type="number" min="100" step="100" value={deposit} onChange={(event) => setDeposit(Number(event.target.value))} />
                  <span>USDC</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/vault/${vaults[0]?.id ?? ""}`)}
                className="mt-2 flex min-h-12 w-full items-center justify-center bg-[#4BFFB3] px-5 text-sm font-bold text-black transition-colors hover:bg-white"
              >
                Open vault →
              </button>
            </div>

            <div className="p-6 lg:p-8 xl:p-10">
              <div className="mb-8 grid gap-4 sm:grid-cols-2">
                <div className="border border-white/8 bg-white/[0.04] p-5">
                  <span className="site-ui-label text-white/42">Projected net APR</span>
                  <div className="mt-3 text-4xl font-semibold text-[#4BFFB3]">{apr}%</div>
                  <p className="mt-1 text-xs text-white/42">After 10% performance fee</p>
                </div>
                <div className="border border-white/8 bg-white/[0.04] p-5">
                  <span className="site-ui-label text-white/42">Monthly yield</span>
                  <div className="mt-3 text-4xl font-semibold text-white">${monthlyYield.toLocaleString()}</div>
                  <p className="mt-1 text-xs text-white/42">On ${Math.max(deposit, 0).toLocaleString()} deposit</p>
                </div>
              </div>

              <div className="grid gap-7 xl:grid-cols-[18rem_1fr] xl:items-start">
                <div className="vault-sim-chart-stage">
                  <DonutChart
                    allocations={allocations}
                    activeName={highlightedAllocation.name}
                    onActiveChange={setActiveAllocation}
                  />
                  <div className="vault-sim-active-card">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: highlightedAllocation.color }} />
                      <strong>{highlightedAllocation.name}</strong>
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">{highlightedAllocation.percent.toFixed(1)}%</div>
                    <p className="mt-1 text-xs leading-5 text-white/46">allocation · active portfolio</p>
                  </div>
                </div>
                <div className="vault-sim-legend-grid">
                  {allocations.map((allocation) => (
                    <button
                      key={allocation.name}
                      type="button"
                      onMouseEnter={() => setActiveAllocation(allocation)}
                      onFocus={() => setActiveAllocation(allocation)}
                      onMouseLeave={() => setActiveAllocation(null)}
                      className="vault-sim-legend-row"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-white/58">
                        <span className="h-2 w-2 shrink-0" style={{ backgroundColor: allocation.color }} />
                        <span className="truncate">{allocation.name}</span>
                      </span>
                      <strong className="font-medium text-white/86">{allocation.percent}%</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="site-ui-label mb-5 text-white/42">AI Committee · Current Vote</div>
                {[
                  ["Quant Conservative", "94%", "T-bill spread holds at 530 bps; momentum signals neutral. Allocation acceptable."],
                  ["Credit Fundamentals", "88%", "Maple borrower base healthy; Goldfinch EM lending coverage ratio 1.9x. No watchlist names."],
                  ["Momentum Tracker", "82%", "Clearpool secondary pricing tight; on-chain wallets stable. Continue current weights."],
                ].map(([name, percent, description]) => (
                  <div key={name} className="border-b border-white/8 py-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3 text-sm font-medium text-white">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4BFFB3]/18 text-[0.68rem] text-[#4BFFB3]">✓</span>
                        {name}
                      </span>
                      <span className="text-sm text-white/54">{percent}</span>
                    </div>
                    <p className="ml-8 mt-2 max-w-[42rem] text-xs leading-6 text-white/46">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const VaultsIndexPage = () => {
  const { address, connect, isConnecting } = useWallet();
  const navigate = useNavigate();
  const { status: preloaderStatus } = usePreloader();
  const isRevealed = preloaderStatus === "done";
  const goToHowItWorks = () => {
    navigate("/");
    window.setTimeout(() => {
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#020202] text-white">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isRevealed ? 1 : 0, y: isRevealed ? 0 : 20 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex min-h-[100svh] overflow-hidden px-6 pb-16 pt-28 md:px-12 md:pt-32 lg:px-24"
      >
        <img
          src="/vault-hero.png"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="vault-hero-image pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.92)_19%,rgba(0,0,0,0.42)_45%,rgba(0,0,0,0.06)_73%,rgba(0,0,0,0.18)_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,transparent,#020202_92%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-[112rem] items-center">
          <div className="max-w-[32rem] md:max-w-[36rem]">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#4BFFB3] shadow-[0_0_16px_rgba(75,255,179,0.7)]" />
              <span className="site-ui-label text-white">Protocol Live</span>
            </div>

            <h1 className="font-display text-[4.25rem] font-bold leading-[0.98] tracking-0 text-white sm:text-[5.5rem] lg:text-[7.2rem]">
              The
              <br />
              Vault
            </h1>

            <p className="site-body mt-8 max-w-[22rem] text-white/50">
              Institutional-grade liquidity pools, secure, multi-chain.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <VaultButton label="Learn how it works" onClick={goToHowItWorks} />

              <VaultButton
                label={address
                  ? `${address.slice(0, 6)}...${address.slice(-4)}`
                  : isConnecting
                    ? "Connecting..."
                    : "Connect Wallet"}
                onClick={connect}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <VaultSimulator />
    </div>
  );
};
