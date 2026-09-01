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

/**
 * @param {number} id - id de la demande
 * @param {string} statut - 'acceptee' | 'refusee' | 'terminee'
 * @param {string|null} motifRefus - motif si statut === 'refusee'
 * @param {object|null} livrable - { livrable_url, livrable_public_id, livrable_nom_fichier, livrable_message } requis si statut === 'terminee'
 */
export const repondreDemande = async (id, statut, motifRefus = null, livrable = null) => {
  const payload = { statut, motif_refus: motifRefus };
  if (livrable) {
    payload.livrable_url = livrable.livrable_url;
    payload.livrable_public_id = livrable.livrable_public_id;
    payload.livrable_nom_fichier = livrable.livrable_nom_fichier;
    payload.livrable_message = livrable.livrable_message;
  }
  const res = await api.patch(`/talent/demandes/${id}`, payload);
  return res.data;
};