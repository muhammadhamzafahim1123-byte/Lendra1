import { motion } from "motion/react";
import { useLocation } from "react-router-dom";
import { usePreloader } from "./PreloaderContext";

export const Navbar = ({ onLogoClick }: { onLogoClick: () => void }) => {
  const { status } = usePreloader();
  const isRevealed = status !== "loading";
  const { pathname } = useLocation();
  const isVaultPage = pathname.startsWith("/vault");

  const navPositionClass = isVaultPage ? "absolute inset-x-0 top-0" : "relative";

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={isRevealed ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{
        duration: 1.2,
        delay: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`${navPositionClass} z-50 px-6 py-4 bg-brand-midnight/40 backdrop-blur-md md:bg-transparent md:backdrop-blur-none md:px-12 md:py-6 lg:px-24`}
    >
      <div className="mx-auto flex w-full max-w-[112rem] items-center justify-between">
        <img
          src="/Lendra1.svg"
          alt="LENDRA1"
          className="h-6 w-auto md:h-8 shrink-0 cursor-pointer"
          onClick={onLogoClick}
        />

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#yield" className="hover:text-white transition-colors">Yield</a>
          <a href="#vault" className="hover:text-white transition-colors">Vaults</a>
        </div>

        <div className="hidden md:block w-[8rem]" aria-hidden="true" />
      </div>
    </motion.nav>
  );
};
