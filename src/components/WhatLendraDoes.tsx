import { LENDRA_CONTENT } from "../data/content";
import { Section, FadeIn } from "./Layout";

const mechanismPoints = [
  {
    label: "Payment sent",
    value: "Timing gap opens",
  },
  {
    label: "LENDRA1 bridge",
    value: "USD1 liquidity deployed",
  },
  {
    label: "Settlement clears",
    value: "Capital cycles back",
  },
];

const CapitalTimingVideo = () => {
  return (
    <div className="capital-timing-media-frame relative w-full overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#070a09]">
      <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%,rgba(0,0,0,0.18)),radial-gradient(circle_at_78%_20%,rgba(125,239,219,0.18),transparent_28%)]" />
      <video
        className="relative z-10 block h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/Capital%20for%20timing%20gaps.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export const WhatLendraDoes = () => {
  const { whatWeDo } = LENDRA_CONTENT;

  return (
    <Section id="what-we-do" className="capital-timing-section">
      <div className="capital-timing-shell">
        <FadeIn direction="left" className="capital-timing-copy">
          <span className="capital-timing-kicker site-kicker">The Mechanism</span>
          <h2 className="capital-timing-title site-section-heading">{whatWeDo.title}</h2>
          <p className="capital-timing-body site-body">
            {whatWeDo.content}
          </p>
        </FadeIn>

        <FadeIn direction="right" delay={0.18} className="capital-timing-visual">
          <div className="capital-timing-orbit" aria-hidden="true" />
          <CapitalTimingVideo />

          <div className="capital-timing-flow" aria-label="Capital timing flow">
            {mechanismPoints.map((point, index) => (
              <div className="capital-timing-flow-item" key={point.label}>
                <span className="capital-timing-flow-index">0{index + 1}</span>
                <div>
                  <strong>{point.label}</strong>
                  <span>{point.value}</span>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </Section>
  );
};
