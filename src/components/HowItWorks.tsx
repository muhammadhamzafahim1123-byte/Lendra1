import { useEffect, useRef } from "react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

const desktopCardClassName =
  "!h-[25rem] !p-0 overflow-hidden border border-white/10 bg-[#161616] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";

const mobileCardClassName =
  "relative overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm";

const DESKTOP_MEDIA_WIDTH = "29rem";
const staticStepImages: Record<string, string> = {
  "Capital bridge provided": "/Capital%20bridge%20provided.png",
  "Settlement completed": "/Set%20your%20profile.png",
  "Capital redeployed": "/Receive%20a%20personalized%20allocation.png",
};

const SimpleStructureVideo = ({
  mediaLabel,
  className,
}: {
  mediaLabel: string;
  className: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      if (!isVisibleRef.current) return;
      if (document.hidden) return;
      video.play().catch(() => {
        // Autoplay can briefly reject while cards are moving in the stack.
      });
    };

    const restart = () => {
      video.currentTime = 0;
      play();
    };

    const skipBlackTail = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (video.currentTime >= video.duration - 0.12) {
        restart();
      }
    };

    video.muted = true;
    video.loop = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          play();
        } else {
          video.pause();
        }
      },
      { rootMargin: "180px 0px", threshold: 0.05 },
    );

    observer.observe(video);
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    video.addEventListener("ended", restart);
    video.addEventListener("timeupdate", skipBlackTail);
    document.addEventListener("visibilitychange", play);

    return () => {
      observer.disconnect();
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      video.removeEventListener("ended", restart);
      video.removeEventListener("timeupdate", skipBlackTail);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      key={mediaLabel}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source
        src={`/Simple%20Structure%20Animations/${encodeURIComponent(mediaLabel)}.mp4`}
        type="video/mp4"
      />
    </video>
  );
};

const StepMedia = ({
  mediaLabel,
  className,
}: {
  mediaLabel: string;
  className: string;
}) => {
  const imageSrc = staticStepImages[mediaLabel];

  if (imageSrc) {
    return (
      <img
        className={className}
        src={imageSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <SimpleStructureVideo mediaLabel={mediaLabel} className={className} />;
};

const DesktopStepCard = ({
  step,
  index,
  total,
}: {
  step: { label: string; description: string; mediaLabel: string };
  index: number;
  total: number;
}) => {
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_34%),linear-gradient(120deg,transparent,rgba(255,255,255,0.015),transparent)]" />

      <div
        className="relative z-10 flex h-full flex-col px-12 py-10 xl:px-14 xl:py-11"
        style={{ paddingRight: "calc(29rem + 4rem)" }}
      >
        <div>
          <span className="site-kicker block text-white/90">
            STEP {index + 1}:
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <h3 className="site-card-heading max-w-xl text-white">
            {step.label}
          </h3>
          <p className="site-card-body mt-3 max-w-xl text-brand-muted">
            {step.description}
          </p>
        </div>

        <div className="flex items-center gap-4 pr-6">
          <span className="site-kicker text-white/90">
            {stepNumber}/{String(total).padStart(2, "0")}
          </span>
          <div className="h-px flex-1 bg-white/12" />
        </div>
      </div>

      <div
        className="absolute inset-y-0 right-0 z-10 overflow-hidden border-l border-white/8 bg-black"
        style={{ width: DESKTOP_MEDIA_WIDTH }}
      >
        <StepMedia
          mediaLabel={step.mediaLabel}
          className="block h-full w-full object-cover object-center"
        />
      </div>
    </>
  );
};

export const HowItWorks = () => {
  const { howItWorks } = LENDRA_CONTENT;
  const cards = howItWorks.steps;

  return (
    <section
      id="how-it-works"
      className="relative bg-brand-charcoal px-6 py-20 md:px-10 md:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-4 md:mb-6">
          <FadeIn>
            <div className="mx-auto max-w-[56rem] text-center">
              <div>
                <span className="site-kicker mb-4 block text-center text-brand-accent">
                  Process
                </span>
                <h2 className="site-section-heading">
                  {howItWorks.title}
                </h2>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-brand-charcoal" />
          <ScrollStack
            className="how-it-works-stack"
            itemDistance={96}
            itemStackDistance={18}
            stackPosition="12%"
            blurAmount={0}
            rotationAmount={0}
            useWindowScroll
          >
            {cards.map((step, i) => (
              <div key={step.label}>
                <ScrollStackItem itemClassName={desktopCardClassName}>
                  <DesktopStepCard step={step} index={i} total={cards.length} />
                </ScrollStackItem>
              </div>
            ))}
          </ScrollStack>
        </div>

        <div className="space-y-6 lg:hidden">
          {cards.map((step, i) => (
            <article key={step.label} className={mobileCardClassName}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(120deg,transparent,rgba(255,255,255,0.03),transparent)]" />

              <div className="relative z-10 space-y-6 p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center border border-white/10 bg-brand-midnight">
                    <span className="font-semibold text-brand-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div>
                  <p className="site-kicker mb-3 text-brand-accent/80">
                    STEP {i + 1}:
                  </p>
                  <h3 className="site-card-heading mb-3 text-white">
                    {step.label}
                  </h3>
                  <p className="site-card-body max-w-2xl text-brand-muted">
                    {step.description}
                  </p>
                </div>

                <div className="relative flex min-h-[15rem] items-center justify-center overflow-hidden bg-black/60">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_52%)]" />
                  <div className="relative flex aspect-square h-full max-h-full max-w-full items-center justify-center overflow-hidden">
                    <StepMedia
                      mediaLabel={step.mediaLabel}
                      className="relative z-10 h-full w-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
