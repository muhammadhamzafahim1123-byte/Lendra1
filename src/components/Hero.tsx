import { motion } from "motion/react";
import { LENDRA_CONTENT } from "../data/content";
import { VaultButton } from "./VaultButton";
import { usePreloader } from "./PreloaderContext";

export const Hero = ({ onEnterVault }: { onEnterVault: () => void }) => {
  const { hero } = LENDRA_CONTENT;
  const { status } = usePreloader();
  const isRevealed = status !== "loading";
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-section relative h-[100svh] overflow-hidden px-6 pb-4 pt-32 md:-mt-20 md:px-12 md:pb-6 lg:px-24">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={isRevealed ? { scale: 1.1, opacity: 1 } : { scale: 1.1, opacity: 0 }}
        transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="hero-visual absolute inset-0 -mt-50 h-full w-full object-cover object-[85%_50%] md:mt-0 md:h-screen md:w-screen md:object-right"
        src="/Hero_Visual.png"
        alt=""
        fetchPriority="high"
        aria-hidden="true"
      />
      {/* TEMP IMAGE — replace with brand asset */}
      <motion.img
        initial={{ scale: 1.04, opacity: 0 }}
        animate={isRevealed ? { scale: 1.04, opacity: 0.28 } : { scale: 1.04, opacity: 0 }}
        transition={{ duration: 2.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden h-full w-[62%] object-cover object-center mix-blend-screen md:block"
        src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1600&q=80"
        alt=""
        aria-hidden="true"
      />

      {/* Enhanced bottom overlay for mobile legibility */}
      <div className="hero-readable-overlay pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/40 to-transparent md:bg-none" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[112rem] items-end pb-10 md:pb-0">
        <div className="flex w-full items-end">
          <div className="hero-copy flex w-full max-w-none flex-col items-start justify-end self-end text-left md:-translate-y-12">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hero-heading site-hero-heading mb-5 max-w-[46rem]"
            >
              {hero.headline}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              className="hero-body site-body mb-4 max-w-2xl text-brand-muted"
            >
              {hero.subtext}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isRevealed ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 mb-4 flex flex-wrap items-center gap-4"
            >
              <VaultButton label={hero.primaryCTA} onClick={onEnterVault} />
              <VaultButton label={hero.secondaryCTA} onClick={scrollToHowItWorks} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
