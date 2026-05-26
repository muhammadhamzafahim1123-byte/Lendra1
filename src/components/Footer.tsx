import { lazy, Suspense } from "react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";
import { VaultButton } from "./VaultButton";

const MagicRings = lazy(() => import("./MagicRings"));

export const FinalCTA = ({ onEnterVault }: { onEnterVault: () => void }) => {
  const { finalCTA } = LENDRA_CONTENT;

  return (
    <section className="relative overflow-hidden bg-brand-midnight">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-100">
          <Suspense fallback={null}>
            <MagicRings
              color="#80e8e1"
              colorTwo="#c2904c"
              ringCount={6}
              speed={1.7}
              attenuation={10}
              lineThickness={2}
              baseRadius={0.6}
              radiusStep={0.18}
              scaleRate={0.18}
              opacity={1}
              blur={0}
              noiseAmount={0.1}
              rotation={0}
              ringGap={1.3}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={false}
              mouseInfluence={0.2}
              hoverScale={1.08}
              parallax={0.05}
              clickBurst
            />
          </Suspense>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:px-10 md:py-24 lg:px-16">
        <FadeIn>
          <h2 className="site-section-heading mb-12">{finalCTA.title}</h2>
          <p className="site-body mx-auto -mt-6 mb-10 max-w-2xl text-brand-muted">
            {finalCTA.subtext}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <VaultButton label={finalCTA.primaryCTA} onClick={onEnterVault} />
            <VaultButton
              label={finalCTA.secondaryCTA}
              onClick={() => window.location.assign("#trust-architecture")}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { footer } = LENDRA_CONTENT;

  return (
    <footer className="border-t border-white/6 bg-[#151515] px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[96rem]">
        <div className="grid gap-12 pb-16 md:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] md:items-start lg:pb-20">
          <div>
            <img
              src="/Lendra1.svg"
              alt="LENDRA1"
              className="mb-7 h-7 w-auto opacity-90"
            />
            <p className="max-w-[25rem] text-[0.98rem] leading-7 text-brand-muted">
              {footer.text}
            </p>
          </div>

          <nav
            className="flex flex-wrap gap-8 md:justify-end md:pt-1 lg:gap-10"
            aria-label="Footer"
          >
            {footer.links.map((link, i) => (
              <a
                key={i}
                href="#"
                className="text-sm font-medium text-brand-muted transition-colors hover:text-white"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/8 pt-9 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.67rem] font-semibold uppercase tracking-[0.22em] text-brand-muted">
            © 2026 LENDRA1. ALL RIGHTS RESERVED.
          </p>

          <div className="flex items-center gap-5">
            <div className="h-2 w-2 rounded-full bg-white" />
            <span className="text-[0.67rem] font-semibold uppercase tracking-[0.22em] text-brand-muted">
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
