import api from "./api"; // ← remplace "./auth.service"

// ✅ PROFIL TALENT (auto-service)
export const getProfilTalent = async () => {
  const res = await api.get("/talent/profil");
  return res.data;
};

export const updateProfilTalent = async (formData) => {
  const res = await api.post("/talent/profil", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};