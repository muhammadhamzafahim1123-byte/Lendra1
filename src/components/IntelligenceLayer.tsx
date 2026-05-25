import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

export const IntelligenceLayer = () => {
  const { intelligence } = LENDRA_CONTENT;

  return (
    <section className="relative overflow-hidden bg-brand-midnight px-6 py-24 md:px-12 lg:px-24">
      {/* TEMP IMAGE — replace with brand asset */}
      <img
        src="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1800&q=80"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.68)_46%,rgba(0,0,0,0.9)_100%),radial-gradient(circle_at_18%_18%,rgba(125,239,219,0.12),transparent_34%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-[112rem] border-t border-white/10 pt-12">
        <FadeIn>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.75fr)] lg:items-start">
            <div>
              <span className="site-kicker mb-5 block text-brand-accent">
                {intelligence.kicker}
              </span>
              <h2 className="site-section-heading max-w-[46rem] text-white">
                {intelligence.title}
              </h2>
            </div>

            <p className="site-body max-w-[42rem] text-brand-muted lg:pt-11">
              {intelligence.body}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
