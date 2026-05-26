import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

export const IntelligenceLayer = () => {
  const { intelligence } = LENDRA_CONTENT;

  return (
    <section id="intelligence" className="relative overflow-hidden bg-black px-6 py-20 md:px-10 md:py-24 lg:px-16">
      <img
        src="/Ai%20intelegence.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[100%] max-w-none object-cover object-[66%_center] opacity-100 md:w-[82%] md:object-center lg:w-[74%] xl:w-[68%]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.86)_30%,rgba(0,0,0,0.28)_50%,transparent_68%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[96rem] pt-10">
        <FadeIn>
          <div className="max-w-[54rem]">
            <span className="site-kicker mb-5 block text-brand-accent">
              {intelligence.kicker}
            </span>
            <h2 className="site-section-heading max-w-[46rem] text-white">
              {intelligence.title}
            </h2>
            <p className="site-body mt-8 max-w-[44rem] text-brand-muted">
              {intelligence.body}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
