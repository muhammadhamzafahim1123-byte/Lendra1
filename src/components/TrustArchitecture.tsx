import {
  BarChart3,
  Layers,
  LucideIcon,
  Minus,
  Plus,
  Radar,
  Timer,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

const sectionIcons = [Layers, Radar, Timer, BarChart3, Wallet] as const;
const agentImages = [
  "/Conservative%20Quant.png",
  "/Credit%20Analyst.png",
  "/Momentum%20Tracker.png",
] as const;
const botConfigs = [
  {
    width: "78%",
    maxWidth: "17.25rem",
  },
  {
    width: "68%",
    maxWidth: "15.4rem",
  },
  {
    width: "78%",
    maxWidth: "18rem",
  },
] as const;

const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-accent">
    <Icon size={28} strokeWidth={1.5} />
  </div>
);

const ScrollScrubVideo = ({ src }: { src: string }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 58,
    damping: 34,
    restDelta: 0.0001,
  });

  useEffect(() => {
    let rafId = 0;

    const sync = () => {
      const video = videoRef.current;

      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const targetTime = smoothProgress.get() * Math.max(video.duration - 0.08, 0);

        if (Math.abs(video.currentTime - targetTime) > 0.012) {
          video.currentTime = targetTime;
        }

        if (!video.paused) video.pause();
      }

      rafId = requestAnimationFrame(sync);
    };

    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [smoothProgress]);

  return (
    <section
      ref={sectionRef}
      className="opportunity-video-section relative left-1/2 min-h-[42rem] w-screen -translate-x-1/2 overflow-hidden border-t border-white/10 bg-black"
    >
      <video
        ref={videoRef}
        className="opportunity-video absolute inset-0 h-full w-full object-cover object-left"
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        className="opportunity-video-side-fade pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.36)_42%,rgba(0,0,0,0.9)_70%,#000_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#000_0%,transparent_16%,transparent_84%,#000_100%)]"
        aria-hidden="true"
      />
    </section>
  );
};

const OpportunityUniverseSection = ({
  section,
}: {
  section: {
    kicker: string;
    title: string;
    description: string;
    descriptionTwo?: string;
    closing?: string;
  };
}) => (
  <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
    <ScrollScrubVideo src="/A%20single%20transfer.mp4" />
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
      <div className="opportunity-content-shell mx-auto flex w-full min-h-0 max-w-[96rem] items-center px-6 py-16 md:px-10 md:py-18 lg:px-16">
        <FadeIn className="opportunity-copy pointer-events-auto w-full max-w-[43rem] text-left lg:ml-auto">
          <span className="site-kicker mb-4 block text-brand-accent">
            {section.kicker}
          </span>
          <h2 className="site-section-heading max-w-[40rem] text-white">
            {section.title}
          </h2>
          <div className="site-body mt-8 max-w-[39rem] space-y-6 text-white/78">
            <p>{section.description}</p>
            {section.descriptionTwo ? <p>{section.descriptionTwo}</p> : null}
            {section.closing ? (
              <p className="site-card-heading max-w-[36rem] pt-2 text-white">
                {section.closing}
              </p>
            ) : null}
          </div>
        </FadeIn>
      </div>
    </div>
  </section>
);

const AgentCard = ({
  agent,
  index,
}: {
  agent: { label: string; description: string };
  index: number;
}) => {
  const imageSrc = agentImages[index % agentImages.length];
  const config = botConfigs[index % botConfigs.length];

  return (
    <article className="group relative mx-auto flex h-[29rem] w-full max-w-[27.5rem] overflow-hidden rounded-[1.35rem] border border-white/35 bg-black p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)] md:h-[31rem] md:p-6">
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_42%,rgba(123,239,221,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.045),transparent_34%)]" />
      <div className="pointer-events-none absolute -inset-x-16 top-5 h-56 rounded-[50%] border border-cyan-300/12" />
      <div className="pointer-events-none absolute -inset-x-10 bottom-[-11rem] h-60 rounded-[50%] border border-cyan-300/20 shadow-[0_0_48px_rgba(125,239,219,0.18)]" />

      <div className="relative z-10 grid h-full w-full grid-rows-[15rem_4.75rem_1fr] items-center text-center md:grid-rows-[16.5rem_5rem_1fr]">
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="absolute bottom-4 h-8 w-40 rounded-[50%] bg-brand-accent/22 blur-2xl" />
          <div
            className="relative z-10 max-h-full transition-transform duration-500 group-hover:scale-[1.025]"
            style={{ width: config.width, maxWidth: config.maxWidth }}
          >
            <img
              src={imageSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="block h-auto w-full object-contain drop-shadow-[0_0_26px_rgba(125,239,219,0.18)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center px-1">
          <h3 className="font-display text-[1.75rem] font-semibold leading-tight text-white md:text-[1.95rem]">
            {agent.label}
          </h3>
        </div>

        <div className="flex items-start justify-center px-2 pt-2">
          <p className="mx-auto max-w-[18.5rem] text-[0.98rem] font-medium leading-7 text-white/78 md:text-[1.02rem]">
            {agent.description}
          </p>
        </div>
      </div>
    </article>
  );
};

const NarrativeSection = ({
  section,
  index,
}: {
  section: {
    kicker: string;
    title: string;
    description: string;
    descriptionTwo?: string;
    closing?: string;
  };
  index: number;
}) => {
  if (index === 0) {
    return <OpportunityUniverseSection section={section} />;
  }

  const Icon = sectionIcons[index % sectionIcons.length];
  const isRiskIntelligence = section.label === "Risk Intelligence";
  const isExitSignals = section.label === "Exit Signals";
  const isCounterfactualReporting = section.label === "Counterfactual Reporting";
  const isEconomics = section.label === "Economics";
  const visualImageSrc = isRiskIntelligence
    ? "/Risk%20Intelligence.png"
    : isExitSignals
      ? "/Exit%20Signals.png"
      : isCounterfactualReporting
        ? "/Counterfactual%20Reporting.jpg"
        : isEconomics
          ? "/Performance%20Linked%20Fee.png"
          : null;

  return (
    <section className="relative border-t border-white/10 py-18 md:py-22">
      <FadeIn>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.56fr)_minmax(22rem,0.44fr)] lg:items-center lg:gap-12">
          <div>
            <div className="max-w-[58rem]">
              <div className="mb-8 flex items-center gap-4">
                <CardIcon icon={Icon} />
                <span className="site-kicker text-brand-accent">{section.kicker}</span>
              </div>
              <h2 className="site-section-heading max-w-4xl text-white">
                {section.title}
              </h2>
            </div>

            <div className="site-body mt-10 max-w-[58rem] space-y-6 text-brand-muted">
              <p>{section.description}</p>
              {section.descriptionTwo ? <p>{section.descriptionTwo}</p> : null}
              {section.closing ? (
                <p className="site-card-heading max-w-[48rem] pt-2 text-white">
                  {section.closing}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className="relative mx-auto aspect-square w-full max-w-[26rem] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] shadow-[0_20px_80px_rgba(0,0,0,0.24)] lg:mr-0"
            aria-hidden="true"
          >
            {visualImageSrc ? (
              <img
                src={visualImageSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(125,239,219,0.08),transparent_34%),radial-gradient(circle_at_84%_78%,rgba(194,144,76,0.06),transparent_32%)]" />
                <div className="absolute inset-5 rounded-xl border border-dashed border-white/10" />
                <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.035),transparent)]" />
              </>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

const FAQAccordion = ({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-white/10 py-20 md:py-24">
      <FadeIn>
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="font-display text-[2.25rem] font-medium leading-[1.04] text-white md:text-[3.15rem]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-[30rem] text-sm leading-6 text-brand-muted md:text-[0.95rem]">
            Find answers to common questions about LENDRA1, portfolio allocation, risk review, and vault mechanics.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[46rem] gap-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] shadow-[0_14px_46px_rgba(0,0,0,0.2)] transition-colors duration-300 hover:border-white/14"
              >
                <button
                  type="button"
                  className="flex min-h-[3.9rem] w-full items-center justify-between gap-5 px-5 text-left md:min-h-[4.25rem] md:px-6"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-[1rem] font-medium leading-snug text-white md:text-[1.08rem]">
                    {item.question}
                  </span>
                  <motion.span
                    className="relative flex h-8 w-8 shrink-0 items-center justify-center text-white/90"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AnimatePresence initial={false} mode="wait">
                      {isOpen ? (
                        <motion.span
                          key="minus"
                          initial={{ opacity: 0, scale: 0.72 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.72 }}
                          transition={{ duration: 0.16 }}
                        >
                          <Minus size={18} />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="plus"
                          initial={{ opacity: 0, scale: 0.72 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.72 }}
                          transition={{ duration: 0.16 }}
                        >
                          <Plus size={18} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 md:px-6 md:pb-6">
                        <p className="max-w-[38rem] text-left text-sm leading-6 text-brand-muted">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
};

export const TrustArchitecture = () => {
  const { trustArchitecture, faq } = LENDRA_CONTENT;

  return (
    <section id="trust-architecture" className="relative bg-brand-charcoal px-6 py-20 md:px-10 md:py-24 lg:px-16 lg:py-28">
      <div className="mx-auto w-full max-w-[96rem]">
        <section id="ai-committee" className="relative pb-20 md:pb-24">
          <FadeIn>
            <div className="mx-auto max-w-[70rem] text-center">
              <div>
                <span className="site-kicker mb-4 block justify-center text-brand-accent">
                  {trustArchitecture.kicker}
                </span>
                <h2 className="site-section-heading mx-auto max-w-4xl">
                  {trustArchitecture.title}
                </h2>
              </div>

              <div className="site-body mx-auto mt-6 max-w-[62rem] text-brand-muted">
                <p>
                  {trustArchitecture.body} {trustArchitecture.bodyTwo}
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="mx-auto mt-14 grid max-w-[88rem] gap-7 md:grid-cols-3">
            {trustArchitecture.agents.map((agent, index) => (
              <AgentCard key={agent.label} agent={agent} index={index} />
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-4xl text-center text-[1.05rem] font-medium leading-7 text-white/86">
            {trustArchitecture.closing}
          </p>
        </section>

        {trustArchitecture.sections.map((section, index) => (
          <NarrativeSection key={section.label} section={section} index={index} />
        ))}

        <FAQAccordion items={faq.items} />
      </div>
    </section>
  );
};
