import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

interface VaultButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
}

type Ripple = { x: number; y: number; id: number };
type VaultShaderMount = ShaderMount & { destroy?: () => void };

export const VaultButton = ({
  label = "Vaults",
  className = "",
  onClick,
  viewMode = "text",
}: VaultButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMountRef = useRef<VaultShaderMount | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dimensions = useMemo(() => {
    const baseHeight = isMobile ? 38 : 46;
    const baseInnerHeight = baseHeight - 4;

    if (viewMode === "icon") {
      return {
        width: baseHeight,
        height: baseHeight,
        innerWidth: baseInnerHeight,
        innerHeight: baseInnerHeight,
        shaderWidth: baseHeight,
        shaderHeight: baseHeight,
      };
    }

    const textScale = isMobile ? 8.5 : 9.25;
    const padding = isMobile ? 44 : 56;
    const minWidth = isMobile ? 110 : 132;
    const textButtonWidth = Math.max(minWidth, Math.round(label.length * textScale + padding));

    return {
      width: textButtonWidth,
      height: baseHeight,
      innerWidth: textButtonWidth - 4,
      innerHeight: baseInnerHeight,
      shaderWidth: textButtonWidth,
      shaderHeight: baseHeight,
    };
  }, [label, viewMode, isMobile]);

  useEffect(() => {
    const styleId = "vault-liquid-metal-ripple-style";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .vault-liquid-metal__shader canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 999px !important;
        }

        @keyframes vault-liquid-metal-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.55;
          }

          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!shaderRef.current) return;

    if (shaderMountRef.current?.destroy) {
      shaderMountRef.current.destroy();
    }

    try {
      shaderMountRef.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 8,
          u_shape: 1,
          u_offsetX: 0.1,
          u_offsetY: -0.1,
        },
        undefined,
        0.6,
      );
    } catch (error) {
      console.error("Failed to initialize vault shader", error);
      shaderMountRef.current = null;
    }

    return () => {
      if (shaderMountRef.current?.destroy) {
        shaderMountRef.current.destroy();
        shaderMountRef.current = null;
      }
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMountRef.current?.setSpeed?.(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMountRef.current?.setSpeed?.(0.6);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    shaderMountRef.current?.setSpeed?.(2.4);
    window.setTimeout(() => {
      shaderMountRef.current?.setSpeed?.(isHovered ? 1 : 0.6);
    }, 300);

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        id: rippleIdRef.current++,
      };

      setRipples((prev) => [...prev, ripple]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== ripple.id));
      }, 600);
    }

    onClick?.();
  };

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            transformStyle: "preserve-3d",
            transition:
              "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
            transform: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, gap 0.4s ease",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {viewMode === "icon" ? (
              <Sparkles
                size={16}
                style={{
                  color: "#d7d7d7",
                  filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.45))",
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    fontSize: isMobile ? "13px" : "14px",
                    color: "#f4f4f4",
                    fontWeight: 500,
                    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.55)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <ArrowRight
                  size={isMobile ? 14 : 16}
                  style={{
                    color: "#f4f4f4",
                    filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.45))",
                    transition: "transform 0.25s ease",
                    transform: isHovered ? "translateX(2px)" : "translateX(0)",
                  }}
                />
              </>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${dimensions.innerWidth}px`,
                height: `${dimensions.innerHeight}px`,
                margin: "2px",
                borderRadius: "999px",
                background: "linear-gradient(180deg, #1d1d1d 0%, #060606 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.38), inset 0px 1px 2px rgba(0, 0, 0, 0.25)"
                  : "none",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${dimensions.height}px`,
                width: `${dimensions.width}px`,
                borderRadius: "999px",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 2px 0px rgba(0, 0, 0, 0.18)"
                    : "0px 0px 0px 1px rgba(255, 255, 255, 0.12), 0px 24px 14px 0px rgba(0, 0, 0, 0.04), 0px 14px 10px 0px rgba(0, 0, 0, 0.08), 0px 5px 6px 0px rgba(0, 0, 0, 0.12)",
                transition:
                  "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease, box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                background: "rgb(0 0 0 / 0)",
              }}
            >
              <div
                ref={shaderRef}
                className="vault-liquid-metal__shader"
                style={{
                  borderRadius: "999px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${dimensions.shaderWidth}px`,
                  maxWidth: `${dimensions.shaderWidth}px`,
                  height: `${dimensions.shaderHeight}px`,
                  transition: "width 0.4s ease, height 0.4s ease",
                }}
              />
            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              transition:
                "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease",
              overflow: "hidden",
              borderRadius: "999px",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "vault-liquid-metal-ripple 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
};
