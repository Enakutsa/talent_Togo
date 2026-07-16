import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfTalent from "./components/RedirectIfTalent";

import Home from "./pages/commun/Home";
import Inscription from "./pages/auth/Inscription";
import NotFound         from "./pages/commun/NotFound";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ProfilCreer from "./pages/talent/ProfilCreer";
import TalentDashboard from "./pages/talent/TalentDashboard";
import Portfolio from "./pages/talent/Portfolio";
import DemandesRecues from "./pages/talent/DemandesRecues";
import AvisRecus from "./pages/talent/AvisRecus";
import RechercheTalents from "./pages/client/RechercheTalents";
import DetailTalent from "./pages/client/DetailTalent";
import ClientDashboard from "./pages/client/ClientDashboard";
import Favoris from "./pages/client/Favoris";
import Messages from "./pages/client/Messages";
import DemandesEnvoyees from "./pages/client/DemandesEnvoyees";
import ClientProfil from "./pages/client/ClientProfil";
import Parametres from "./pages/client/Parametres";

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

        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />

        <Route path="/verify-otp" element={<PublicLayout><VerifyOtp /></PublicLayout>} />

        <Route path="/recherche" element={<PublicLayout><RechercheTalents /></PublicLayout>} />

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
        <Route path="/talent/demandes" element={<ProtectedRoute><DemandesRecues /></ProtectedRoute>} />
        <Route path="/talent/avis" element={<ProtectedRoute><AvisRecus /></ProtectedRoute>} />

        {/* ── Espace client ── */}
        <Route path="/client/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/favoris" element={<ProtectedRoute><Favoris /></ProtectedRoute>} />
        <Route path="/client/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/client/demandes" element={<ProtectedRoute><DemandesEnvoyees /></ProtectedRoute>} />
        <Route path="/client/profil" element={<ProtectedRoute><ClientProfil /></ProtectedRoute>} />
        <Route path="/client/parametres" element={<ProtectedRoute><Parametres /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}