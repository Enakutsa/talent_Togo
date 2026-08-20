import api from "./api"; // ton instance axios existante

export const initierPaiementAbonnement = () =>
  api.post("/abonnement/initier").then((res) => res.data);