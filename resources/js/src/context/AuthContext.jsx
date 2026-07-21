import { createContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

/**
 * AuthContext
 * Gère l'état d'authentification de l'utilisateur connecté (talent, client ou admin).
 *
 * ✅ Le token est stocké en sessionStorage (pas localStorage) : il est
 * effacé automatiquement à la fermeture de l'onglet/navigateur, pour que
 * l'utilisateur soit déconnecté plutôt que de rester connecté indéfiniment.
 *
 * user: { id, nom, email, role, avatar? } | null
 * token: string | null (token Sanctum)
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app : si un token existe déjà (dans CET onglet), on
  // récupère l'utilisateur. Un nouvel onglet/une nouvelle fenêtre n'a pas
  // accès au sessionStorage d'un autre onglet, donc pas de session
  // "fantôme" qui traînerait après fermeture du navigateur.
  useEffect(() => {
    const stored = sessionStorage.getItem("token");
    if (!stored) {
      setLoading(false);
      return;
    }

    api
      .get("/user")
      .then((res) => setUser(res.data.data ?? res.data))
      .catch(() => {
        sessionStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, authToken) => {
    sessionStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("token");
    setUser(null);
    setToken(null);
    api.post("/logout").catch(() => {});
  }, []);

  // Recharge l'utilisateur depuis l'API (photo, bio, tarifs à jour...).
  // À appeler après toute mise à jour de profil pour que le header/dashboard
  // reflètent immédiatement les changements, sans attendre un refresh de page.
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data.data ?? res.data);
    } catch {
      // silencieux : si ça échoue, l'ancien état reste affiché
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, refreshUser, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}