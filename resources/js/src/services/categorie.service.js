import api from "./auth.service";

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};