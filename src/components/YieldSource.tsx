import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

export const YieldSource = () => {
  const { singleTransfer } = LENDRA_CONTENT;

  return (
    <section
      id="yield"
      className="relative thesis-section flex min-h-0 flex-col overflow-hidden bg-black md:min-h-[40rem] lg:block lg:h-auto lg:min-h-[46rem]"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <img
          src="/Personalization.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute bottom-0 left-1/2 h-full w-[142%] max-w-none -translate-x-[58%] object-cover object-center opacity-100 sm:w-[118%] md:left-0 md:w-[68%] md:translate-x-0 md:object-left lg:w-[58%] xl:w-[52%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_46%,rgba(0,0,0,0.74)_72%,#000_100%)]" />
      </div>
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[96rem] px-6 pb-16 pt-10 md:px-10 md:py-20 lg:min-h-[42rem] lg:items-center lg:px-16">
        <div className="w-full max-w-[46rem] text-left lg:ml-auto lg:w-[52%] xl:w-[48%]">
          <FadeIn>
            <span className="site-kicker mb-4 block text-brand-accent">
              {singleTransfer.kicker}
            </span>
            <h2 className="personalization-heading mb-8 max-w-[45rem] text-white">
              {singleTransfer.title}
            </h2>
            <div className="site-body max-w-[34rem] space-y-6">
              {singleTransfer.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-white/80">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
