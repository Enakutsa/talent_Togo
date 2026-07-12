import api from "./api";

export const getMesDemandes = async (page = 1, statut = null) => {
  const params = { page };
  if (statut) params.statut = statut;
  const res = await api.get("/client/demandes", { params });
  return res.data;
};

export const envoyerDemande = async (payload) => {
  const res = await api.post("/client/demandes", payload);
  return res.data;
};

export const annulerDemande = async (id) => {
  const res = await api.delete(`/client/demandes/${id}`);
  return res.data;
};

export const getDemandesRecues = async () => {
  const res = await api.get("/talent/demandes");
  return res.data;
};

export const repondreDemande = async (id, statut, motifRefus = null) => {
  const res = await api.patch(`/talent/demandes/${id}`, { statut, motif_refus: motifRefus });
  return res.data;
};