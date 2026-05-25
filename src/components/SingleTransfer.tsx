import { LENDRA_CONTENT } from "../data/content";
import { Section, FadeIn } from "./Layout";
import { StickyScroll, type StickyScrollItem } from "./ui/StickyScrollReveal";

const YieldVisual = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative h-full overflow-hidden rounded-[1.5rem]">
    <img src={src} alt={alt} className="block h-full w-full object-cover object-center" />
  </div>
);

const transferSteps: StickyScrollItem[] = [
  {
    title: "Real transaction demand",
    description:
      "Yield is tied to actual economic activity.",
    content: (
      <YieldVisual
        src="/Yield%20from%20real%20movement/Real%20transaction%20demand.png"
        alt="Real transaction demand visual"
      />
    ),
  },
  {
    title: "Short-duration capital usage",
    description:
      "High velocity capital recycling.",
    content: (
      <YieldVisual
        src="/Yield%20from%20real%20movement/Short-duration%20capital%20usage.png"
        alt="Short-duration capital usage visual"
      />
    ),
  },
  {
    title: "No artificial incentives",
    description:
      "Pure market-driven returns.",
    content: (
      <YieldVisual
        src="/Yield%20from%20real%20movement/No%20artificial%20incentives.png"
        alt="No artificial incentives visual"
      />
    ),
  },
];

export const SingleTransfer = () => {
  const { yieldSource } = LENDRA_CONTENT;

  return (
    <Section className="relative overflow-visible bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_30%),linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)]">
      <div className="mb-16 max-w-6xl text-left">
        <FadeIn>
          <span className="site-kicker mb-4 block text-brand-accent">
            Case Study
          </span>
          <h2 className="site-section-heading mb-6">
            {yieldSource.title}
          </h2>
          <p className="site-body max-w-5xl text-brand-muted">
            {yieldSource.content}
          </p>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <div>
          <div className="hidden lg:block">
            <StickyScroll content={transferSteps} />
          </div>

          {/* Mobile-only Card Layout */}
          <div className="flex flex-col gap-12 lg:hidden mt-12">
            {transferSteps.map((step, index) => (
              <div key={index} className="flex flex-col">
                <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-[1.5rem]">
                  {step.content}
                </div>
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center border border-brand-accent bg-brand-accent text-sm font-semibold text-brand-midnight">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <h3 className="site-card-heading mb-3 text-white">
                    {step.title}
                  </h3>
                  <p className="site-card-body text-brand-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
};
