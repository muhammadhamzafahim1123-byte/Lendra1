import type { ReactNode } from "react";
import { FadeIn } from "./Layout";

export const VaultParticipation = ({
  disableFade = false,
  id = "vault",
  contentPosition = "right",
}: {
  disableFade?: boolean;
  id?: string;
  contentPosition?: "left" | "right";
  onEnterVault: () => void;
}) => {
  const contentPositionClass =
    contentPosition === "left" ? "mr-auto" : "ml-auto";
  const mediaPositionClass =
    contentPosition === "left" ? "lg:right-0" : "lg:left-0";
  const mediaObjectClass =
    contentPosition === "left" ? "object-right" : "object-left";
  const mediaManualPositionClass = "left-0 top-0 md:left-[10%]";
  const mediaManualTransformClass = "scale-100";
  const mediaFadeClass =
    contentPosition === "left"
      ? "lg:bg-gradient-to-r lg:from-black lg:via-transparent lg:to-transparent"
      : "lg:bg-gradient-to-l lg:from-black lg:via-transparent lg:to-transparent";
  const backedByLogos = Array.from({ length: 12 }, (_, index) => `Logo ${index + 1}`);

  const content = (
    <div className="max-w-[34rem]">
      <span className="site-ui-label mb-4 block text-white/45">
        Backed by
      </span>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {backedByLogos.map((logo) => (
          <div
            key={logo}
            className="site-ui-label flex h-12 items-center justify-center border border-white/10 bg-white/[0.035] px-3 text-center text-white/45"
          >
            {logo}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = (children: ReactNode) =>
    disableFade ? children : <FadeIn direction="left">{children}</FadeIn>;

  return (
    <section
      id={id}
      className="relative flex flex-col overflow-hidden bg-black pb-10 pt-0 lg:block lg:min-h-[44rem] lg:py-24"
    >
      <div className={`pointer-events-none relative h-[48vh] shrink-0 lg:absolute lg:inset-y-0 lg:h-full lg:w-[70%] ${mediaPositionClass}`}>
        <img
          src="/Capital%20participation.png"
          alt=""
          className={`vault-participation-pc-image absolute h-[100%] w-[100%] md:h-[88%] md:top-27 object-cover ${mediaObjectClass} ${mediaManualPositionClass} ${mediaManualTransformClass}`}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent ${mediaFadeClass}`}
          aria-hidden="true"
        />
      </div>
      <div className="relative z-10 mx-auto -mt-14 w-full max-w-[112rem] px-6 md:mt-8 md:px-12 lg:mt-0 lg:flex lg:min-h-[44rem] lg:items-center lg:px-24">
        <div className={`mb-16 w-full max-w-[44rem] text-left lg:mb-0 lg:w-[50%] xl:w-[45%] ${contentPositionClass}`}>
          {renderContent(content)}
        </div>
      </div>
    </section>
  );
};
