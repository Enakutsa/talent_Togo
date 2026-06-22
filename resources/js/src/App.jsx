import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/commun/Home";
import Inscription from "./pages/auth/Inscription";
import Login from "./pages/auth/Login";
import VerifyOtp from "./pages/auth/VerifyOtp"; // ✅ ajouté

export default function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Inscription />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} /> {/* ✅ OTP */}
      </Routes>

      <Footer />
    </AuthProvider>
  );
}