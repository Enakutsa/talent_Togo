import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return null; // ou un spinner, le temps de vérifier le token au chargement
  }

  if (!isAuthenticated) {
    // On mémorise d'où l'utilisateur venait, pour le rediriger après connexion
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}