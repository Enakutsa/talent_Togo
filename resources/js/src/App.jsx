import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfTalent from "./components/RedirectIfTalent";

import Home from "./pages/commun/Home";
import Inscription from "./pages/auth/Inscription";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ProfilCreer from "./pages/talent/ProfilCreer";
import TalentDashboard from "./pages/talent/TalentDashboard";
import Portfolio from "./pages/talent/Portfolio";
import DetailTalent from "./pages/client/DetailTalent";
import ClientDashboard from "./pages/client/ClientDashboard";
import Favoris from "./pages/client/Favoris";
import Messages from "./pages/client/Messages";
import DemandesEnvoyees from "./pages/client/DemandesEnvoyees";

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
        {/* ── Pages publiques : inaccessibles à un talent déjà connecté ── */}
        <Route path="/" element={<RedirectIfTalent><PublicLayout><Home /></PublicLayout></RedirectIfTalent>} />
        <Route path="/register" element={<RedirectIfTalent><PublicLayout><Inscription /></PublicLayout></RedirectIfTalent>} />
        <Route path="/login" element={<RedirectIfTalent><PublicLayout><Login /></PublicLayout></RedirectIfTalent>} />
        <Route path="/verify-otp" element={<RedirectIfTalent><PublicLayout><VerifyOtp /></PublicLayout></RedirectIfTalent>} />

        <Route
          path="/talents/:id"
          element={
            <ProtectedRoute>
              <PublicLayout><DetailTalent /></PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Espace talent ── */}
        <Route path="/talent/profil/creer" element={<ProtectedRoute><ProfilCreer /></ProtectedRoute>} />
        <Route path="/talent/dashboard" element={<ProtectedRoute><TalentDashboard /></ProtectedRoute>} />
        <Route path="/talent/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />

        {/* ── Espace client ── */}
        <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/favoris" element={<ProtectedRoute><Favoris /></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/client/demandes" element={<ProtectedRoute><DemandesEnvoyees /></ProtectedRoute>} />

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