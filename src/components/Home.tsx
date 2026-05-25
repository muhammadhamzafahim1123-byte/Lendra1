import { motion } from "motion/react";
import { Hero } from "./Hero";
import { Positioning } from "./Positioning";
import { WhatLendraDoes } from "./WhatLendraDoes";
import { HowItWorks } from "./HowItWorks";
import { YieldSource } from "./YieldSource";
import { IntelligenceLayer } from "./IntelligenceLayer";
import { TrustArchitecture } from "./TrustArchitecture";
import { VaultParticipation } from "./VaultParticipation";
import { FinalCTA, Footer } from "./Footer";
import { usePreloader } from "./PreloaderContext";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const { status, setStatus, setView } = usePreloader();
    const isRevealed = status !== "loading";
    const navigate = useNavigate();

    const handleNavigateToVault = () => {
        setStatus("loading");
        setView("vault");
        navigate("/vault");
        window.scrollTo(0, 0);
    };

    return (
        <motion.div
            key="home-view"
            initial={{ opacity: 0 }}
            animate={isRevealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
        >
            <Hero onEnterVault={handleNavigateToVault} />
            <WhatLendraDoes />
            <Positioning />
            <HowItWorks />
            <YieldSource />
            <IntelligenceLayer />
            <TrustArchitecture />
            {/* <VaultParticipation
                id="vault"
                contentPosition="left"
                disableFade
                onEnterVault={handleNavigateToVault}
            /> */}
            <FinalCTA onEnterVault={handleNavigateToVault} />
            <Footer />
        </motion.div>
    );
};
