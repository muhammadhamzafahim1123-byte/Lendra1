import React, { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface StickyScrollItem {
  title: string;
  description: string;
  content: ReactNode;
}

interface StickyScrollProps {
  content: StickyScrollItem[];
  className?: string;
}

export function StickyScroll({
  content,
  className = "",
}: StickyScrollProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitionSeed, setTransitionSeed] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!content.length) return;

    const updateActiveIndex = () => {
      const viewportAnchor = window.innerHeight * 0.38;
      let closestIndex = 0;
      let smallestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        const itemAnchor = rect.top + rect.height * 0.3;
        const distance = Math.abs(itemAnchor - viewportAnchor);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    updateActiveIndex();
    window.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);

    return () => {
      window.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [content]);

  useEffect(() => {
    if (previousIndex === activeIndex) return;
    if (previousIndex === null) {
      setPreviousIndex(activeIndex);
      return;
    }

    setPreviousIndex((currentPrevious) => {
      if (currentPrevious === activeIndex) return currentPrevious;
      return currentPrevious;
    });
  }, [activeIndex, previousIndex]);

  useEffect(() => {
    setTransitionSeed((value) => value + 1);

    const timeout = window.setTimeout(() => {
      setPreviousIndex(activeIndex);
    }, 360);

    return () => window.clearTimeout(timeout);
  }, [activeIndex]);

  const activeItem = useMemo(() => content[activeIndex] ?? content[0], [activeIndex, content]);
  const previousItem = useMemo(
    () => (previousIndex === null ? null : content[previousIndex] ?? null),
    [content, previousIndex],
  );
  const pixelBlocks = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: `${transitionSeed}-${index}`,
        delay: (index % 6) * 0.025 + Math.floor(index / 6) * 0.035,
      })),
    [transitionSeed],
  );

  return (
    <div className={`grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:gap-16 ${className}`.trim()}>
      <div className="relative">
        <div className="space-y-0">
          {content.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={item.title}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className={`flex min-h-[72vh] items-center border-l pl-6 transition-all duration-300 md:min-h-[78vh] md:pl-8 ${
                  isActive
                    ? "border-brand-accent opacity-100"
                    : "border-white/10 opacity-20"
                }`}
              >
                <div className="w-full max-w-xl">
                  <div className="mb-4 flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center border text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "border-brand-accent bg-brand-accent text-brand-midnight"
                          : "border-white/10 bg-white/5 text-white/70"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <h3 className="site-card-heading mb-4 text-white">
                    {item.title}
                  </h3>
                  <p className="site-card-body max-w-xl text-brand-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div className="sticky top-24">
          <div className="relative h-[82vh] overflow-hidden">
            {previousItem && previousIndex !== activeIndex ? (
              <motion.div
                key={`previous-${previousIndex}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 0.12, duration: 0.28, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {previousItem.content}
              </motion.div>
            ) : null}

            <motion.div
              key={`active-${activeItem?.title ?? activeIndex}`}
              initial={{ opacity: 0.92, scale: 1.015 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full"
            >
              {activeItem?.content}

              <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-5">
                <AnimatePresence>
                  {pixelBlocks.map((block) => (
                    <motion.div
                      key={block.id}
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 0.86 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        delay: 0.08 + block.delay,
                        duration: 0.24,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="bg-[#050505]"
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
