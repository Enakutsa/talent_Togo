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

// Routes sur lesquelles on ne veut pas la navbar/footer publics
const ROUTES_SANS_LAYOUT = [
  "/talent/dashboard",
  "/talent/profil/creer",
];

function AppContent() {
  const location = useLocation();

  const sansLayout = ROUTES_SANS_LAYOUT.some((r) =>
    location.pathname.startsWith(r)
  );

  return (
    <>
      {!sansLayout && <Navbar />}

      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/register"            element={<Inscription />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/verify-otp"          element={<VerifyOtp />} />
        <Route path="/talent/profil/creer" element={<ProfilCreer />} />
        <Route path="/talent/dashboard"    element={<TalentDashboard />} />
      </Routes>

      {!sansLayout && <Footer />}
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