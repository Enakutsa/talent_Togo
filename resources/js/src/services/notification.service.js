import api from "./api";

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const marquerLue = async (id) => {
  const res = await api.patch(`/notifications/${id}/lu`);
  return res.data;
};

export const toutMarquerLu = async () => {
  const res = await api.patch("/notifications/tout-lire");
  return res.data;
};