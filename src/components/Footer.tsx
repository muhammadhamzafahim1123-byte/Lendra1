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

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center md:px-12 lg:px-24">
        <FadeIn>
          <h2 className="site-section-heading mb-12">
            {finalCTA.title}
          </h2>
          <p className="site-body mx-auto -mt-6 mb-10 max-w-2xl text-brand-muted">
            {finalCTA.subtext}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <VaultButton label={finalCTA.primaryCTA} onClick={onEnterVault} />
            <VaultButton label={finalCTA.secondaryCTA} onClick={() => window.location.assign("#trust-architecture")} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { footer } = LENDRA_CONTENT;

  return (
    <footer className="bg-brand-midnight border-t border-white/5 py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <img
              src="/Lendra1.svg"
              alt="LENDRA1"
              className="mb-6 h-6 w-auto"
            />
            <p className="site-card-body max-w-sm text-brand-muted">
              {footer.text}
            </p>
          </div>

          <div className="flex flex-wrap gap-8 md:justify-end">
            {footer.links.map((link, i) => (
              <a key={i} href="#" className="text-sm font-medium text-brand-muted hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="site-ui-label text-brand-muted">
            © 2026 LENDRA1. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="site-ui-label text-brand-muted">System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
