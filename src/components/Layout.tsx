import { motion } from "motion/react";
import { CSSProperties, ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

export const Section = ({ children, className = "", id, style }: SectionProps) => {
  return (
    <section
      id={id}
      style={style}
      className={`relative px-6 py-20 md:px-10 md:py-24 lg:px-16 overflow-hidden ${className}`}
    >
      <div className="mx-auto max-w-[96rem] relative z-10">
        {children}
      </div>
    </section>
  );
};

export const FadeIn = ({ children, delay = 0, direction = "up", className = "" }: { children: ReactNode, delay?: number, direction?: "up" | "down" | "left" | "right", className?: string }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : direction === "down" ? -40 : 0,
      x: direction === "left" ? 40 : direction === "right" ? -40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};
