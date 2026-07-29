import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Même style de spinner que le PageLoader utilisé par le Suspense de
// lazy loading dans App.jsx — pour une transition visuellement cohérente,
// qu'on attende le téléchargement d'un chunk ou la vérification du token.
function AuthLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div className="auth-spinner" />
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // ✅ Avant : return null -> page totalement blanche pendant la
    // vérification du token (effet "flash blanc" avant chargement).
    // Maintenant : un spinner cohérent avec le reste de l'app.
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    // On mémorise d'où l'utilisateur venait, pour le rediriger après connexion
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}