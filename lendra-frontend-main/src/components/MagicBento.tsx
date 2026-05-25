import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

import "./MagicBento.css";

export interface MagicBentoProps {
  children: React.ReactNode;
  className?: string;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_GLOW = "132, 0, 255";

const createParticle = (x: number, y: number, glowColor: string) => {
  const particle = document.createElement("div");
  particle.className = "magic-bento-particle";
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.setProperty("--glow-color", glowColor);
  return particle;
};

const updateCardGlow = (
  card: HTMLElement,
  clientX: number,
  clientY: number,
  radius: number,
  intensity: number,
) => {
  const rect = card.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${x}%`);
  card.style.setProperty("--glow-y", `${y}%`);
  card.style.setProperty("--glow-radius", `${radius}px`);
  card.style.setProperty("--spotlight-radius", `${radius}px`);
  card.style.setProperty("--glow-intensity", `${intensity}`);
  card.style.setProperty("--spotlight-intensity", `${intensity}`);
};

const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = "",
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = 400,
  particleCount = 12,
  enableTilt = false,
  glowColor = DEFAULT_GLOW,
  clickEffect = true,
  enableMagnetism = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const cardParticles = useRef(new Map<HTMLElement, HTMLDivElement[]>());

  const shouldAnimate = useMemo(() => {
    if (disableAnimations) return false;
    if (typeof window === "undefined") return true;
    return window.innerWidth > 768;
  }, [disableAnimations]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !shouldAnimate) return;

    const cards = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-magic-card]"),
    );

    cards.forEach((card) => {
      card.style.setProperty("--glow-color", glowColor);
      card.classList.toggle("magic-bento-card--border-glow", enableBorderGlow);
    });

    const clearParticles = (card: HTMLElement) => {
      const particles = cardParticles.current.get(card) ?? [];
      particles.forEach((particle) => {
        gsap.to(particle, {
          scale: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
          onComplete: () => particle.remove(),
        });
      });
      cardParticles.current.set(card, []);
    };

    const spawnParticles = (card: HTMLElement) => {
      if (!enableStars) return;

      const rect = card.getBoundingClientRect();
      const particles = Array.from({ length: particleCount }, () =>
        createParticle(
          Math.random() * rect.width,
          Math.random() * rect.height,
          glowColor,
        ),
      );

      particles.forEach((particle, index) => {
        card.appendChild(particle);
        gsap.fromTo(
          particle,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.25,
            delay: index * 0.03,
            ease: "back.out(1.7)",
          },
        );

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(particle, {
          opacity: 0.25,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      cardParticles.current.set(card, particles);
    };

    const handleWrapperMove = (event: MouseEvent) => {
      if (enableSpotlight && spotlightRef.current) {
        const rect = wrapper.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        if (!inside) {
          gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });
        } else {
          gsap.to(spotlightRef.current, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            opacity: 1,
            duration: 0.18,
            ease: "power2.out",
          });
        }
      }
    };

    const handleWrapperLeave = () => {
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.25, ease: "power2.out" });
      }

      cards.forEach((card) => {
        card.style.setProperty("--glow-intensity", "0");
        card.style.setProperty("--spotlight-intensity", "0");
        gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.25, ease: "power2.out" });
        clearParticles(card);
      });
    };

    const cleanups = cards.map((card) => {
      const onEnter = () => {
        spawnParticles(card);
      };

      const onLeave = () => {
        card.style.setProperty("--glow-intensity", "0");
        card.style.setProperty("--spotlight-intensity", "0");
        gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.25, ease: "power2.out" });
        clearParticles(card);
      };

      const onMove = (event: MouseEvent) => {
        updateCardGlow(card, event.clientX, event.clientY, spotlightRadius, 1);

        const rect = card.getBoundingClientRect();
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        if (enableTilt) {
          const rotateX = ((localY - centerY) / centerY) * -6;
          const rotateY = ((localX - centerX) / centerX) * 6;

          gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.16,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        }

        if (enableMagnetism) {
          gsap.to(card, {
            x: (localX - centerX) * 0.04,
            y: (localY - centerY) * 0.04,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      };

      const onClick = (event: MouseEvent) => {
        if (!clickEffect) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const radius = Math.max(rect.width, rect.height);

        const ripple = document.createElement("div");
        ripple.style.position = "absolute";
        ripple.style.left = `${x - radius}px`;
        ripple.style.top = `${y - radius}px`;
        ripple.style.width = `${radius * 2}px`;
        ripple.style.height = `${radius * 2}px`;
        ripple.style.borderRadius = "9999px";
        ripple.style.pointerEvents = "none";
        ripple.style.zIndex = "4";
        ripple.style.background = `radial-gradient(circle, rgba(${glowColor}, 0.25) 0%, rgba(${glowColor}, 0.12) 30%, transparent 70%)`;

        card.appendChild(ripple);

        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => ripple.remove(),
          },
        );
      };

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove", onMove);
      card.addEventListener("click", onClick);

      return () => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("click", onClick);
        clearParticles(card);
      };
    });

    wrapper.addEventListener("mousemove", handleWrapperMove);
    wrapper.addEventListener("mouseleave", handleWrapperLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleWrapperMove);
      wrapper.removeEventListener("mouseleave", handleWrapperLeave);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [
    shouldAnimate,
    enableStars,
    enableSpotlight,
    enableBorderGlow,
    spotlightRadius,
    particleCount,
    enableTilt,
    glowColor,
    clickEffect,
    enableMagnetism,
    textAutoHide,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={`magic-bento ${className}`.trim()}
      style={{ ["--glow-color" as string]: glowColor }}
    >
      {enableSpotlight ? (
        <div
          ref={spotlightRef}
          className="magic-bento-spotlight"
          style={{ ["--glow-color" as string]: glowColor }}
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

export default MagicBento;
