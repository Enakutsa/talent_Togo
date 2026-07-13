import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

// ✅ TOKEN automatique
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ REGISTER
export const register = async (data) => {
  const isFormData = data instanceof FormData;
  const res = await api.post("/auth/register", data, {
    headers: isFormData
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" },
  });
  return res.data;
};

// ✅ LOGIN
export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

// ✅ OTP
export const verifyLoginOtp = async (data) => {
  const res = await api.post("/auth/verify-login-otp", data);
  return res.data;
};

export const resendOtp = async (utilisateur_id) => {
  const res = await api.post("/auth/resend-otp", { utilisateur_id });
  return res.data;
};

// ✅ USER
export const getUser = async () => {
  const res = await api.get("/user");
  return res.data;
};

// ✅ LOGOUT
export const logout = async () => {
  const res = await api.post("/logout");
  localStorage.removeItem("token");
  return res.data;
};

// ✅ MISE À JOUR PROFIL CLIENT (photo + infos de base)
// Si le payload contient un fichier (FormData), on utilise POST + _method=PUT
// car Laravel ne peut pas lire les fichiers depuis une requête PUT/PATCH classique.
export const updateUser = async (payload) => {
  const isFormData = payload instanceof FormData;

  if (isFormData) {
    // Spoofing Laravel : POST avec _method=PUT
    payload.append("_method", "PUT");
    const res = await api.post("/user", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  // Pas de fichier → PUT JSON classique
  const res = await api.put("/user", payload);
  return res.data;
};

export default api;