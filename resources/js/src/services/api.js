import axios from "axios";

/* ================= CONFIG AXIOS ================= */

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

/* ================= TOKEN ================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* ================= EXPORT ================= */

export default api;