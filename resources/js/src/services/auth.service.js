import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false, // ✅ IMPORTANT
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

export default api;
