import axios from "axios";

/* ================= CONFIG AXIOS ================= */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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

/* ================= AUTO-REFRESH GLOBAL ================= */
// ✅ À chaque action qui modifie des données (POST/PUT/PATCH/DELETE) qui
// réussit, on émet un événement global "app:data-changed" sur `window`.
// N'importe quelle page peut écouter cet événement (voir le hook
// useAutoRefresh) pour relancer son fetch automatiquement, sans que
// l'utilisateur ait besoin d'actualiser la page lui-même.
//
// On envoie l'URL de la requête dans le détail de l'événement, pour que
// les pages qui le souhaitent puissent filtrer (ex: ne réagir qu'aux
// changements liés à "/demandes"), mais par défaut une page peut aussi
// simplement écouter tout sans filtrer.
const MUTATING_METHODS = ["post", "put", "patch", "delete"];

function notifyDataChanged(config) {
  const method = (config?.method || "").toLowerCase();
  if (MUTATING_METHODS.includes(method)) {
    window.dispatchEvent(
      new CustomEvent("app:data-changed", {
        detail: {
          method,
          url: config?.url || "",
        },
      })
    );
  }
}

/* ================= ERROR HANDLING ================= */
api.interceptors.response.use(
  (response) => {
    notifyDataChanged(response.config);
    return response;
  },
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