import api from "./api";

export const signalerTalent = async (payload) => {
  const res = await api.post("/client/signalements", payload);
  return res.data;
};