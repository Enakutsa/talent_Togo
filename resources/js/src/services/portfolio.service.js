import api from "./auth.service";

export const getPortfolio = async () => {
  const res = await api.get("/talent/portfolio");
  return res.data; // { success, data: [...] }
};

export const addPortfolioItem = async (formData) => {
  const res = await api.post("/talent/portfolio", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deletePortfolioItem = async (id) => {
  const res = await api.delete(`/talent/portfolio/${id}`);
  return res.data;
};