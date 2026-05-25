import { useRef, useEffect } from "react";
import { useScroll, useSpring } from "motion/react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

export const YieldSource = () => {
  const { singleTransfer } = LENDRA_CONTENT;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileImageFrameClass = "relative z-10 h-[18rem] w-full overflow-hidden md:hidden";
  const mobileImagePositionClass = "top-0 left-1/2";
  const mobileImageSizeClass = "h-full w-[250%] max-w-none";
  const mobileImageObjectClass = "object-cover object-center";
  const mobileImageTransformClass = "-translate-x-[26%] translate-y-0 scale-100";

  const transferIntroParagraphs = singleTransfer.paragraphs;

  // Professional Scroll Scrubbing logic
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.3", "end -0.1"],
  });

  // High-fidelity momentum filter for that "pro" feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 30,
    restDelta: 0.0001
  });

  // Symmetric High-Frequency Sync Loop
  useEffect(() => {
    let rafId: number;
    let lastTime = -1;

    const sync = () => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) {
        rafId = requestAnimationFrame(sync);
        return;
      }

      const progress = smoothProgress.get();
      // Leave a tiny buffer at the end (0.1s) to prevent browser-level "end-of-file" sticking
      const targetTime = progress * (video.duration - 0.1);

      // Symmetric sync: Update if changed - works identically up and down
      if (Math.abs(targetTime - lastTime) > 0.01) {
        video.currentTime = targetTime;
        lastTime = targetTime;
      }

      if (!video.paused) video.pause();
      rafId = requestAnimationFrame(sync);
    };

    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [smoothProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.pause();
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="yield"
      className="relative thesis-section flex min-h-0 flex-col overflow-hidden bg-brand-midnight md:min-h-[40rem] lg:block lg:h-auto lg:min-h-[46rem]"
    >
      {/* Mobile Static Asset */}
      <div className={mobileImageFrameClass} aria-hidden="true">
        <img
          src="/A%20single%20transfer.png"
          alt=""
          className={`absolute ${mobileImagePositionClass} ${mobileImageSizeClass} ${mobileImageObjectClass} ${mobileImageTransformClass}`}
        />
        {/* TEMP IMAGE — replace with brand asset */}
        <img
          src="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=900&q=80"
          alt=""
          className="personalization-temp-visual pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-midnight to-transparent" />
      </div>

      {/* Background Video Stack */}
      <div className="absolute inset-0 z-0 hidden overflow-hidden pointer-events-none md:block">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-left"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/A%20single%20transfer.mp4" type="video/mp4" />
        </video>
        {/* TEMP IMAGE — replace with brand asset */}
        <img
          src="https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="personalization-temp-visual pointer-events-none absolute inset-y-0 left-0 h-full w-[78%] object-cover opacity-26 mix-blend-screen"
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />

        {/* Gradient overlay from the right for text legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-brand-midnight/90 via-brand-midnight/40 to-transparent lg:bg-gradient-to-l lg:from-brand-midnight/95 lg:via-brand-midnight/70 lg:to-transparent lg:from-0% lg:via-45% lg:to-80%"
          aria-hidden="true"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[112rem] px-6 pb-16 pt-10 md:px-12 md:py-20 lg:min-h-[46rem] lg:items-center lg:px-24">
        <div className="w-full max-w-[46rem] text-left lg:ml-auto lg:w-[52%] xl:w-[48%]">
          <FadeIn>
            <span className="site-kicker mb-4 block text-brand-accent drop-shadow-sm">
              {singleTransfer.kicker}
            </span>
            <h2 className="personalization-heading mb-8 max-w-[45rem] text-white drop-shadow-md">
              {singleTransfer.title}
            </h2>
            <div className="site-body max-w-[34rem] space-y-6">
              {transferIntroParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-white/80 leading-relaxed drop-shadow-sm">
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
