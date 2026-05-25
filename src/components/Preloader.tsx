import { useEffect, useRef, useState, type ComponentType } from "react";
import { usePreloader } from "./PreloaderContext";

const HOME_CRITICAL_ASSETS = {
    images: [
        "/Hero_Visual.png",
        "/Lendra1.svg",
        "/A%20single%20transfer.png",
    ],
    videos: [
        "/A%20single%20transfer.mp4",
        "/Simple%20Structure%20Animations/Transfer%20initiated.mp4",
        "/Simple%20Structure%20Animations/Capital%20bridge%20provided.mp4",
        "/Simple%20Structure%20Animations/Settlement%20completed.mp4",
        "/Simple%20Structure%20Animations/Credit%20repaid.mp4",
        "/Simple%20Structure%20Animations/Capital%20redeployed.mp4",
    ]
};

const loadImageAsset = (src: string) =>
    new Promise<void>((resolve) => {
        const image = new Image();
        const finish = () => resolve();
        image.onload = async () => {
            try { await image.decode?.(); } catch { }
            finish();
        };
        image.onerror = finish;
        image.src = src;
    });

const loadVideoAsset = (src: string) =>
    new Promise<void>((resolve) => {
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";

        const finish = () => {
            video.oncanplaythrough = null;
            video.onerror = null;
            resolve();
        };

        video.oncanplaythrough = finish;
        video.onerror = finish;
        video.src = src;
        video.load();

        // Timeout for video loading to prevent hangs on slow connections
        setTimeout(finish, 10000);
    });

const waitForHomepageReady = () => {
    const fontReady =
        "fonts" in document
            ? document.fonts.ready.then(() => undefined).catch(() => undefined)
            : Promise.resolve();

    const assetsReady = Promise.allSettled([
        ...HOME_CRITICAL_ASSETS.images.map(loadImageAsset),
        ...HOME_CRITICAL_ASSETS.videos.map(loadVideoAsset),
    ]).then(() => undefined);

    return Promise.all([fontReady, assetsReady]).then(() => undefined);
};

export function Preloader() {
    const { setStatus, view, videoReady } = usePreloader();
    const [progress, setProgress] = useState(0);
    const [animData, setAnimData] = useState<unknown>(null);
    const [LottieComponent, setLottieComponent] = useState<ComponentType<any> | null>(null);
    const [homeReady, setHomeReady] = useState(false);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const hasRevealed = useRef(false);
    const homeReadyRef = useRef(homeReady);
    const viewRef = useRef(view);

    useEffect(() => {
        homeReadyRef.current = homeReady;
    }, [homeReady]);

    useEffect(() => {
        viewRef.current = view;
    }, [view]);

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            import("lottie-react"),
            fetch("/Lendra preloader.json").then((r) => r.json()),
        ])
            .then(([lottieModule, animationData]) => {
                if (!isMounted) return;
                setLottieComponent(() => lottieModule.default);
                setAnimData(animationData);
            })
            .catch(console.error);

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (view !== "home") {
            setHomeReady(true);
            return;
        }

        let isMounted = true;

        const timeout = window.setTimeout(() => {
            if (isMounted) setHomeReady(true);
        }, 6000);

        waitForHomepageReady().then(() => {
            if (!isMounted) return;
            window.clearTimeout(timeout);
            setHomeReady(true);
        });

        return () => {
            isMounted = false;
            window.clearTimeout(timeout);
        };
    }, [view]);

    useEffect(() => {
        // Scroll lock
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Drive progress bar independently and robustly
    useEffect(() => {
        const duration = 3200; // 3.2 seconds minimum for a premium sequence
        const start = performance.now();
        let rafId: number;

        const animateProgress = (now: number) => {
            const elapsed = now - start;
            const pct = Math.min(elapsed / duration, 1);

            // Hold near complete until the real loading guard is satisfied.
            const eased = Math.sin((pct * Math.PI) / 2);
            const isWaitingForHome = viewRef.current === "home" && !homeReadyRef.current;
            const cap = isWaitingForHome ? 92 : 100;
            const nextProgress = Math.round(eased * cap);
            setProgress((currentProgress) => Math.max(currentProgress, nextProgress));

            if (pct < 1 || isWaitingForHome) {
                rafId = requestAnimationFrame(animateProgress);
            }
        };

        rafId = requestAnimationFrame(animateProgress);
        return () => cancelAnimationFrame(rafId);
    }, []);

    // Main Orchestration Gate
    useEffect(() => {
        // Gate 1: Progress must reach 100%
        if (progress < 100) return;

        // Gate 2: If we are heading to the Vault, wait for the cinematic video
        if (view === "vault" && !videoReady) return;

        // Gate 3: If we are heading home, wait for critical homepage assets
        if (view === "home" && !homeReady) return;

        // Prevent double triggers
        if (hasRevealed.current) return;
        hasRevealed.current = true;

        // STEP 1: If Vault, mount and start the video behind the curtains
        if (view === "vault") {
            setStatus("video");
        } else {
            setStatus("revealing");
        }

        // STEP 2: Split the curtains!
        setIsRevealing(true);

        // STEP 3: Complete transition after curtains split
        setTimeout(() => {
            setIsDone(true);
            if (view !== "vault") {
                // Just reveal the homepage
                setStatus("done");
            }
            document.body.style.overflow = "";
        }, 2000); // 2 seconds (matches the 1.8s CSS transition width padding)

    }, [progress, view, videoReady, homeReady, setStatus]);

    if (isDone) return null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100000,
                pointerEvents: isRevealing ? "none" : "all",
            }}
        >
            <div
                className="preloader-panel preloader-panel--left"
                data-revealing={String(isRevealing)}
            />
            <div
                className="preloader-panel preloader-panel--right"
                data-revealing={String(isRevealing)}
            />

            <div
                className="preloader-content"
                style={{
                    opacity: isRevealing ? 0 : 1,
                    transition: "opacity 0.18s ease",
                }}
            >
                <div className="preloader-lottie">
                    {LottieComponent && animData && (
                        <LottieComponent
                            animationData={animData}
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    )}
                </div>

                <div className="preloader-bar-wrapper">
                    <div className="preloader-bar-track">
                        <div
                            className="preloader-bar-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="preloader-bar-pct">{progress}%</span>
                </div>
            </div>
        </div>
    );
}
