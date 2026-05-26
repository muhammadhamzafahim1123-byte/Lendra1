import { motion } from "motion/react";
import { LENDRA_CONTENT } from "../data/content";
import { VaultButton } from "./VaultButton";
import { usePreloader } from "./PreloaderContext";

export const Hero = ({ onEnterVault }: { onEnterVault: () => void }) => {
  const { hero } = LENDRA_CONTENT;
  const { status } = usePreloader();
  const isRevealed = status !== "loading";
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="hero-section relative h-[100svh] min-h-[42rem] overflow-hidden bg-black px-6 pb-4 pt-32 md:-mt-20 md:px-12 md:pb-6 lg:px-24">
      <motion.div
        initial={{ scale: 1.04, opacity: 0 }}
        animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 1.04, opacity: 0 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="hero-visual-frame pointer-events-none absolute inset-x-0 top-16 isolate mx-auto h-[72%] w-full max-w-[125rem] overflow-hidden bg-black"
        aria-hidden="true"
      >
        <div className="hero-visual-matte absolute inset-0 bg-black" />
        <img
          className="hero-visual relative z-[1] h-full w-full object-contain object-top"
          src="/hero-visual-reference.png"
          alt=""
          fetchPriority="high"
        />
      </motion.div>

      {/* Enhanced bottom overlay for mobile legibility */}
      <div
        className="hero-readable-overlay pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[48%] bg-gradient-to-t from-black via-black/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[112rem] items-end justify-center pb-10 md:pb-12 lg:pb-14">
        <div className="flex w-full items-end justify-center">
          <div className="hero-copy flex w-full max-w-[52rem] flex-col items-center justify-end self-end text-center">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hero-heading site-hero-heading mb-5 max-w-[52rem]"
            >
              {hero.headline}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="hero-body site-body mb-4 max-w-[46rem] text-brand-muted"
            >
              {hero.subtext}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 mb-4 flex flex-wrap items-center justify-center gap-4"
            >
              <VaultButton label={hero.primaryCTA} onClick={onEnterVault} />
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="flex h-[46px] min-w-[132px] items-center justify-center rounded-full border border-white/18 bg-white/[0.025] px-6 text-sm font-medium text-white/78 backdrop-blur transition-colors hover:border-[#4BFFB3]/55 hover:text-[#4BFFB3] max-md:h-[38px] max-md:min-w-[110px] max-md:text-[13px]"
              >
                How it works
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
