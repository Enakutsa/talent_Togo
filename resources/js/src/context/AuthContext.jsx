import { createContext, useState, useCallback } from "react";

/**
 * AuthContext
 * Gère l'état d'authentification de l'utilisateur connecté (talent, client ou admin).
 *
 * user: { id, nom, email, role, avatar? } | null
 * token: string | null (token Sanctum/JWT)
 */
export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}