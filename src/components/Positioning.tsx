import { Activity, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import { LENDRA_CONTENT } from "../data/content";
import { FadeIn } from "./Layout";

const solutionSignals = [
  { label: "Risk-shaped", icon: ShieldCheck },
  { label: "Liquidity-aware", icon: SlidersHorizontal },
  { label: "Continuously monitored", icon: Activity },
] as const;

export const Positioning = () => {
  const { positioning } = LENDRA_CONTENT;
  const meshRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liquidRef = useRef({
    currentX: 0.28,
    currentY: 0.45,
    targetX: 0.28,
    targetY: 0.45,
    intensity: 0.34,
    targetIntensity: 0.34,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = meshRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const liquid = liquidRef.current;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawBlob = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number,
    ) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color.replace("ALPHA", String(alpha)));
      gradient.addColorStop(0.34, color.replace("ALPHA", String(alpha * 0.42)));
      gradient.addColorStop(1, color.replace("ALPHA", "0"));
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const render = (time: number) => {
      liquid.currentX += (liquid.targetX - liquid.currentX) * 0.075;
      liquid.currentY += (liquid.targetY - liquid.currentY) * 0.075;
      liquid.intensity += (liquid.targetIntensity - liquid.intensity) * 0.055;

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      context.filter = "blur(30px) saturate(1.25)";

      const x = liquid.currentX * width;
      const y = liquid.currentY * height;
      const pulse = Math.sin(time * 0.0015) * 0.5 + 0.5;
      const base = Math.min(width, height);
      const intensity = liquid.intensity;

      drawBlob(
        x,
        y,
        base * (0.42 + pulse * 0.03),
        "rgba(75, 255, 179, ALPHA)",
        0.23 * intensity,
      );
      drawBlob(
        x + Math.sin(time * 0.0011) * base * 0.16,
        y - Math.cos(time * 0.0013) * base * 0.12,
        base * 0.32,
        "rgba(75, 255, 179, ALPHA)",
        0.13 * intensity,
      );
      drawBlob(
        x - Math.cos(time * 0.001) * base * 0.2,
        y + Math.sin(time * 0.0012) * base * 0.16,
        base * 0.27,
        "rgba(75, 255, 179, ALPHA)",
        0.08 * intensity,
      );
      drawBlob(
        x + Math.cos(time * 0.0008) * base * 0.28,
        y + Math.sin(time * 0.0009) * base * 0.2,
        base * 0.24,
        "rgba(75, 255, 179, ALPHA)",
        0.06 * intensity,
      );

      context.filter = "none";
      context.globalCompositeOperation = "destination-in";
      const mask = context.createRadialGradient(x, y, 0, x, y, base * 0.82);
      mask.addColorStop(0, `rgba(0, 0, 0, ${Math.min(0.95, 0.6 + intensity)})`);
      mask.addColorStop(0.58, "rgba(0, 0, 0, 0.42)");
      mask.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = mask;
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      frameId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const element = meshRef.current;
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect() ?? element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    liquidRef.current.targetX = x / 100;
    liquidRef.current.targetY = y / 100;
    liquidRef.current.targetIntensity = 1;
  };

  const handlePointerLeave = () => {
    liquidRef.current.targetIntensity = 0.18;
  };

  return (
    <section
      ref={meshRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="positioning-gradient-section relative overflow-hidden border-y border-white/5 px-6 py-18 md:px-10 md:py-24 lg:px-16 lg:py-28"
    >
      <canvas ref={canvasRef} className="solution-liquid-canvas" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-[96rem]">
        <div className="relative grid min-h-0 gap-12 lg:min-h-[34rem] lg:grid-cols-[minmax(22rem,0.43fr)_minmax(0,0.57fr)] lg:items-center lg:gap-[clamp(3rem,5vw,6.5rem)]">
        <FadeIn direction="right" className="relative z-10 max-w-[45rem]">
          <div className="mb-6 flex items-center gap-4">
            <h2 className="site-kicker text-brand-accent">
              {positioning.kicker}
            </h2>
            <div className="h-px w-16 bg-gradient-to-r from-white/35 to-transparent" />
          </div>

          <p className="site-section-heading max-w-[44rem] text-white">
            {positioning.title}
          </p>

          <p className="site-body mt-7 max-w-[39rem] text-white/72">
            {positioning.body}
          </p>

          <div className="mt-8 grid max-w-[40rem] gap-3 sm:grid-cols-3">
            {solutionSignals.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex min-h-12 items-center gap-3 border border-white/10 bg-white/[0.035] px-3.5 py-3 text-white/86 backdrop-blur"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#4BFFB3]" strokeWidth={1.8} />
                <span className="text-sm font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-[38rem] border-l border-[#4BFFB3]/60 pl-5 text-[1.08rem] font-medium leading-7 text-white">
            {positioning.line}
          </p>
        </FadeIn>

        <FadeIn
          direction="left"
          className="relative z-10 w-full lg:justify-self-end"
        >
          <div className="relative mx-auto w-full max-w-[48rem] lg:mr-0">
            <div className="solution-image-glass">
              <div className="solution-image-inner">
                <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),transparent_22%,rgba(0,0,0,0.1)_100%)]" />
                <img
                  src="/Solution-slide-2x.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="solution-visual-image block h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
      </div>
    </section>
  );
};
