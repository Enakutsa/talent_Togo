import api from "./api";

export const getFavoris = async () => {
  const res = await api.get("/client/favoris");
  return res.data;
};

export const toggleFavori = async (talentId) => {
  const res = await api.post(`/client/favoris/${talentId}`);
  return res.data;
};