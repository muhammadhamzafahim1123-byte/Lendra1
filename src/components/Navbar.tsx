import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePreloader } from "./PreloaderContext";
import { VaultButton } from "./VaultButton";
import { useWallet } from "../hooks/useWallet";

const landingLinks = [
  { label: "Yield", id: "yield" },
  { label: "Intelligence Layer", id: "intelligence" },
  { label: "AI Committee", id: "ai-committee" },
  { label: "FAQ", id: "faq" },
] as const;

export const Navbar = ({ onLogoClick }: { onLogoClick: () => void }) => {
  const { status, setView } = usePreloader();
  const isRevealed = status !== "loading";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isVaultPage = pathname.startsWith("/vault");
  const { address, connect, isConnecting } = useWallet();

  const navPositionClass = isVaultPage ? "absolute inset-x-0 top-0" : "relative";

  const scrollToLandingSection = (id: string) => {
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    setView("home");

    if (pathname !== "/") {
      navigate("/");
      window.setTimeout(scroll, 120);
      return;
    }

    scroll();
  };

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
      <div className="relative mx-auto flex w-full max-w-[112rem] items-center justify-between">
        <img
          src="/Lendra1.svg"
          alt="LENDRA1"
          className="h-6 w-auto md:h-8 shrink-0 cursor-pointer"
          onClick={onLogoClick}
        />

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 whitespace-nowrap text-sm font-medium text-brand-muted lg:flex">
          {landingLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToLandingSection(link.id)}
              className="cursor-pointer transition-colors hover:text-[#4BFFB3]"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden lg:flex">
          <VaultButton
            label={address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : isConnecting
                ? "Connecting..."
                : "Connect Wallet"}
            onClick={connect}
          />
        </div>
      </div>
    </motion.nav>
  );
};
