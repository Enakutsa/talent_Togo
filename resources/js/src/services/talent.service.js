import api from "./auth.service";

/**
 * Récupère les catégories de services disponibles.
 * GET /api/categories
 */
export async function getCategories() {
  const response = await api.get("/categories");
  return response.data;
}

/**
 * Récupère les talents mis en avant (profils vérifiés/les mieux notés).
 * GET /api/talents/featured
 */
export async function getFeaturedTalents() {
  const response = await api.get("/talents/featured");
  return response.data;
}

/**
 * Récupère les statistiques globales de la plateforme
 * (nombre de talents, clients, prestations, villes couvertes).
 * GET /api/stats
 */
export async function getStats() {
  const response = await api.get("/stats");
  return response.data;
}

/**
 * Récupère les avis/témoignages mis en avant sur la page d'accueil.
 * GET /api/avis/featured
 */
export async function getReviews() {
  const response = await api.get("/avis/featured");
  return response.data;
}

/**
 * Recherche de talents avec filtres (catégorie, ville, recherche texte, budget).
 * GET /api/talents?q=...&ville=...&categorie=...
 */
export async function searchTalents(params = {}) {
  const response = await api.get("/talents", { params });
  return response.data;
}

/**
 * Récupère le détail public d'un talent par son id.
 * GET /api/talents/:id
 */
export async function getTalentById(id) {
  const response = await api.get(`/talents/${id}`);
  return response.data;
}