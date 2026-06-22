import { createContext, useState, useCallback, useEffect } from "react";
import api from "../services/api";

/**
 * AuthContext
 * Gère l'état d'authentification de l'utilisateur connecté (talent, client ou admin).
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
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app : si un token existe déjà, on récupère l'utilisateur
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (!stored) {
      setLoading(false);
      return;
    }

    api
      .get("/user")
      .then((res) => setUser(res.data.data ?? res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, authToken) => {
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    api.post("/logout").catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}