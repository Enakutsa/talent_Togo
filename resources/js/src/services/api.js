import axios from "axios";

/* ================= CONFIG AXIOS ================= */

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

/* ================= TOKEN ================= */
// ✅ sessionStorage (pas localStorage) : cohérent avec AuthContext.jsx —
// le token disparaît à la fermeture de l'onglet/navigateur.

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= ERROR HANDLING ================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* ================= EXPORT ================= */

export default api;