import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { 
  ShieldCheck, 
  Timer, 
  Layers, 
  Users, 
  Wallet,
  LucideIcon 
} from "lucide-react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

const desktopCardClassName =
  "relative w-[28rem] h-[20rem] overflow-hidden border border-white/10 bg-[#161616] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] shrink-0 group hover:border-brand-accent/30 transition-colors duration-500 rounded-2xl";

const mobileCardClassName =
  "relative overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm rounded-2xl";

const trustArchitectureCards = [
  {
    label: "Proof of Transit",
    description:
      "Before any capital is deployed, zkTLS oracles cryptographically confirm a live SWIFT MT103 is in transit, and no deployment happens without that proof.",
    icon: ShieldCheck,
  },
  {
    label: "72 Hour Exposure Cap",
    description:
      "Every cycle carries a maximum 72 hour exposure window, so capital is never stranded in long duration positions, limiting drawdown risk.",
    icon: Timer,
  },
  {
    label: "Junior Senior Tranche Structure",
    description:
      "Operators stake their own first loss capital into the Junior tranche before Lendra1 deploys Senior depositor capital, protecting your position.",
    icon: Layers,
  },
  {
    label: "Vetted Operator Network",
    description:
      "Every operator passes diligence across compliance track record, transaction volume, and corridor reliability before any facility is extended.",
    icon: Users,
  },
  {
    label: "Stablecoin Denominated",
    description:
      "Capital is deposited and returned in stablecoins, reducing direct exposure to volatile token price movements and ensuring predictability.",
    icon: Wallet,
  },
] as const;

const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-accent transition-all duration-500 group-hover:scale-110 group-hover:border-brand-accent/50 group-hover:bg-brand-accent/10">
    <Icon size={28} strokeWidth={1.5} />
  </div>
);

const CardStepNumber = ({ index }: { index: number }) => (
  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-brand-midnight">
    <span className="text-xs font-bold text-brand-accent/60">
      0{index + 1}
    </span>
  </div>
);

const DesktopStepCard = ({
  step,
  index,
}: {
  step: typeof trustArchitectureCards[number];
  index: number;
}) => {
  return (
    <div className={desktopCardClassName}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,239,219,0.08),transparent_50%)]" />
      <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-brand-accent/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
      
      <div className="relative z-10 flex h-full flex-col p-8">
        <div className="flex items-start justify-between">
          <CardIcon icon={step.icon} />
          <CardStepNumber index={index} />
        </div>

        <div className="flex flex-1 flex-col justify-end">
          <h3 className="site-card-heading text-white mb-3">
            {step.label}
          </h3>
          <p className="site-card-body text-brand-muted line-clamp-3">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export const TrustArchitecture = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const calculateDistance = () => {
      if (trackRef.current && scrollRef.current) {
        // Measure the true width of the horizontal track versus its visible container
        const trackWidth = trackRef.current.offsetWidth;
        const containerWidth = scrollRef.current.offsetWidth;
        // The distance needed to align the last card's right edge with the container's right edge
        const distance = Math.max(0, trackWidth - containerWidth);
        setScrollDistance(distance);
      }
    };

    calculateDistance();
    // Re-calculate after assets/fonts are likely settled
    const timer = setTimeout(calculateDistance, 600);
    window.addEventListener("resize", calculateDistance);
    
    return () => {
      window.removeEventListener("resize", calculateDistance);
      clearTimeout(timer);
    };
  }, []);

  // Use clamp: true to ensure the animation doesn't drift past the intended range
  const x = useTransform(scrollYProgress, [0.1, 0.9], [0, -scrollDistance], {
    clamp: true
  });

  return (
    <section
      ref={targetRef}
      id="trust-architecture"
      className="relative h-auto lg:h-[400vh] bg-brand-charcoal"
    >
      <div className="relative lg:sticky lg:top-0 flex h-auto lg:min-h-screen flex-col justify-center overflow-hidden px-6 py-24 md:px-12 lg:px-24 lg:py-32">
        <div className="mx-auto w-full max-w-[112rem]">
          <div className="mb-16 md:mb-20">
            <FadeIn>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,40rem)] lg:items-start lg:gap-16">
                <div>
                  <span className="site-kicker mb-4 block text-brand-accent">
                    TRUST ARCHITECTURE
                  </span>
                  <h2 className="site-section-heading">
                    Verification
                    <br />
                    at core
                  </h2>
                </div>

                <div className="lg:pt-[3.8rem]">
                  <p className="site-body max-w-2xl ml-5 text-brand-muted">
                    Lendra1 is built around one principle, capital should only move when the underlying transaction is already verified, and every layer of the protocol reflects that discipline.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="relative hidden lg:block" ref={scrollRef}>
            <motion.div ref={trackRef} style={{ x }} className="flex gap-10 w-max pb-4">
              {trustArchitectureCards.map((step, i) => (
                <DesktopStepCard key={step.label} step={step} index={i} />
              ))}
            </motion.div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:hidden">
            {trustArchitectureCards.map((step, i) => (
              <article key={step.label} className={mobileCardClassName}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,239,219,0.05),transparent_40%)]" />
                <div className="relative z-10 p-6 flex flex-col h-full min-h-[16rem]">
                  <div className="flex items-start justify-between mb-8">
                    <CardIcon icon={step.icon} />
                    <CardStepNumber index={i} />
                  </div>
                  <div className="mt-auto">
                    <h3 className="site-card-heading mb-2 text-white">
                      {step.label}
                    </h3>
                    <p className="site-card-body text-brand-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
