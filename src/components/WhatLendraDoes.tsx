import { LENDRA_CONTENT } from "../data/content";
import { Section, FadeIn } from "./Layout";

const ProblemVisual = () => {
  return (
    <div className="relative mx-auto aspect-[678/383] w-full max-w-[42.375rem] overflow-hidden rounded-[1.4rem] border border-white/12 bg-[#070a09] lg:mr-0">
      <img
        className="block h-full w-full object-cover"
        src="/Problem-2x.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export const WhatLendraDoes = () => {
  const { whatWeDo } = LENDRA_CONTENT;

  return (
    <Section id="what-we-do" className="capital-timing-section">
      <div className="capital-timing-shell">
        <FadeIn direction="left" className="capital-timing-copy">
          <span className="capital-timing-kicker site-kicker">{whatWeDo.kicker}</span>
          <h2 className="capital-timing-title site-section-heading">{whatWeDo.title}</h2>
          <p className="capital-timing-body site-body">{whatWeDo.content}</p>
        </FadeIn>

        <FadeIn direction="right" delay={0.18} className="capital-timing-visual">
          <div className="capital-timing-orbit" aria-hidden="true" />
          <ProblemVisual />
        </FadeIn>
      </div>
    </Section>
  );
};
