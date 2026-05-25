import { Routes, Route, useNavigate } from "react-router-dom";

import { Preloader } from "./components/Preloader";
import { Navbar } from "./components/Navbar";
import { usePreloader } from "./components/PreloaderContext";
import { VaultPage } from "./components/VaultPage";
import { VaultsIndexPage } from "./components/VaultsIndexPage";
import { VaultVideoPreloader } from "./components/VaultVideoPreloader";
import { Home } from "./components/Home";
import { SmoothScroll } from "./components/SmoothScroll";

export default function App() {
  const { status, setStatus, setView } = usePreloader();
  const navigate = useNavigate();

  const handleNavigateToHome = () => {
    setStatus("loading");
    setView("home");
    navigate("/");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-brand-midnight text-white selection:bg-white selection:text-black">
      <SmoothScroll />

      {/* Global preloader overlay */}
      {(status === "loading" || status === "video" || status === "revealing") && <Preloader key="native-preloader" />}

      <VaultVideoPreloader />
      <Navbar onLogoClick={handleNavigateToHome} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vault" element={<VaultsIndexPage />} />
          <Route path="/vault/:vaultId" element={<VaultPage />} />
        </Routes>
      </main>
    </div>
  );
}
