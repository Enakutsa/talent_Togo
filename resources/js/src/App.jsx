import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/commun/Home";
import Inscription from "./pages/auth/Inscription";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ProfilCreer from "./pages/talent/ProfilCreer";
import TalentDashboard from "./pages/talent/TalentDashboard";

function AppContent() {
  const location = useLocation();

  // Routes qui gèrent leur propre navigation (topbar intégrée) :
  // on n'affiche pas la Navbar/Footer publique dessus.
  const hideLayout =
    location.pathname.startsWith("/talent") ||
    location.pathname.startsWith("/client") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/"                      element={<Home />} />
        <Route path="/register"              element={<Inscription />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/verify-otp"            element={<VerifyOtp />} />
        <Route path="/talent/profil/creer"   element={<ProfilCreer />} />
        <Route path="/talent/dashboard"      element={<TalentDashboard />} />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}