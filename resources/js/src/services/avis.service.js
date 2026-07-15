import api from "./api";

export const envoyerAvis = async (payload) => {
  const res = await api.post("/client/avis", payload);
  return res.data;
};

export const getMesAvis = async () => {
  const res = await api.get("/client/avis");
  return res.data;
};