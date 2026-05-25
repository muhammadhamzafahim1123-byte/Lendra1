import { useEffect, useRef, useState } from "react";
import { usePreloader } from "./PreloaderContext";

/**
 * Vault-specific transition video.
 * This component is only mounted on the /vault route.
 */
export const VaultVideoPreloader = () => {
    const { status, setStatus, setVideoReady, view } = usePreloader();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const shouldPrepareVideo = view === "vault";

    // 1. Initial Preloading: Check readiness
    useEffect(() => {
        if (!shouldPrepareVideo) {
            setVideoReady(false);
            return;
        }

        const video = videoRef.current;
        if (!video) return;

        video.muted = true;
        video.defaultMuted = true;
        video.load();

        const checkReady = () => {
            if (video.readyState >= 3) {
                setVideoReady(true);
            }
        };

        const interval = setInterval(checkReady, 500);
        video.addEventListener('canplaythrough', checkReady);

        // Safety timeout to prevent transition hangs
        const safety = setTimeout(() => {
            console.warn("Vault video transition safety timeout.");
            setVideoReady(true);
        }, 3000);

        return () => {
            clearInterval(interval);
            video.removeEventListener('canplaythrough', checkReady);
            clearTimeout(safety);
        };
    }, [setVideoReady, shouldPrepareVideo]);

    // 2. Playback: Triggered when the native preloader signals "video" status
    useEffect(() => {
        if (status === "video") {
            setIsVisible(true);
            setIsEnding(false);

            const playVideo = async () => {
                if (videoRef.current) {
                    try {
                        videoRef.current.currentTime = 0;
                        videoRef.current.muted = true;
                        videoRef.current.defaultMuted = true;
                        await videoRef.current.play();
                    } catch (err) {
                        console.error("Vault Cinematic Playback error:", err);
                        handleVideoEnd();
                    }
                }
            };
            playVideo();
        } else if (status === "done") {
            // Already finished or skipped
            setIsVisible(false);
        } else {
            // "loading" status or "revealing" native preloader
            setIsVisible(false);
        }
    }, [status]);

    const handleVideoEnd = () => {
        setIsEnding(true);
        // Step 6: Video fades out smoothly
        setTimeout(() => {
            // Step 7: Reveal the Vault content
            setStatus("done");
            setVideoReady(false);
        }, 800);
    };

    return (
        <div
            className={`fixed inset-0 z-[99999] bg-brand-midnight flex items-center justify-center transition-opacity duration-800 ${isVisible && !isEnding ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            <video
                ref={videoRef}
                src="/The Vault preloader.mp4"
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover"
                preload={shouldPrepareVideo ? "auto" : "none"}
                muted
                playsInline
            />
        </div>
    );
};
