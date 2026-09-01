import api from "./api";

/**
 * ✅ Récupère une signature d'upload Cloudinary depuis notre backend,
 * puis upload le fichier DIRECTEMENT vers Cloudinary (pas via Laravel).
 *
 * Avant : navigateur → Laravel → Cloudinary (fichier transféré 2 fois).
 * Après : navigateur → Cloudinary directement (1 seul trajet réseau),
 * ce qui réduit sensiblement le temps d'upload ressenti.
 *
 * @param {File} file
 * @param {string} resourceType - "image" (défaut, inchangé pour l'existant),
 *   "auto" pour laisser Cloudinary détecter (PDF, vidéo, etc. — utile pour
 *   les livrables qui ne sont pas forcément des images), ou "video"/"raw".
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadDirectToCloudinary(file, resourceType = "image") {
  // 1. Demander une signature valide à notre backend
  const sigResponse = await api.post("/cloudinary/signature");
  const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data.data;

  // 2. Upload direct vers Cloudinary — on utilise fetch() natif plutôt
  // que l'instance `api` (qui pointe vers NOTRE backend et ajouterait
  // à tort un header Authorization vers un domaine tiers).
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Échec de l'upload direct vers Cloudinary.");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}