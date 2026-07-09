import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/commun/Home";
import Inscription from "./pages/auth/Inscription";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ProfilCreer from "./pages/talent/ProfilCreer";
import TalentDashboard from "./pages/talent/TalentDashboard";
import Portfolio from "./pages/talent/Portfolio";

// Layout public : Navbar + contenu + Footer.
// Utilisé uniquement pour les pages "site vitrine" (accueil, auth...).
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Pages publiques : Navbar + Footer ── */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Inscription /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/verify-otp" element={<PublicLayout><VerifyOtp /></PublicLayout>} />

        {/* ── Pages talent : ont leur propre header/sidebar, pas de layout public ── */}
        <Route path="/talent/profil/creer" element={<ProfilCreer />} />
        <Route path="/talent/dashboard" element={<TalentDashboard />} />
        <Route path="/talent/portfolio" element={<Portfolio />} />

        {/* ── Attrape-tout : évite une page blanche sur une URL inconnue ── */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Page introuvable
                </h1>
                <p style={{ color: "#6b7280" }}>
                  Cette page n'existe pas ou plus.{" "}
                  <a href="/" style={{ color: "#7c3aed", fontWeight: 600 }}>Retour à l'accueil</a>
                </p>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}