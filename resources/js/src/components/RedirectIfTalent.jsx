import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RedirectIfTalent({ children }) {
  const { user, isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (isAuthenticated && user?.role === "talent") {
    return <Navigate to="/talent/dashboard" replace />;
  }

  return children;
}