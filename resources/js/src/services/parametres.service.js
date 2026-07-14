import api from "./api";

/**
 * Change le mot de passe de l'utilisateur connecté.
 * Passe par le même endpoint que la mise à jour du profil (PUT /user) —
 * en n'envoyant QUE les champs liés au mot de passe, les autres infos
 * (nom, prénom, téléphone) restent inchangées côté backend ("sometimes").
 * PUT /api/user
 * body: { mot_de_passe_actuel, nouveau_mot_de_passe, nouveau_mot_de_passe_confirmation }
 */
export async function changePassword({ motDePasseActuel, nouveauMotDePasse, nouveauMotDePasseConfirmation }) {
  const response = await api.put("/user", {
    mot_de_passe_actuel: motDePasseActuel,
    nouveau_mot_de_passe: nouveauMotDePasse,
    nouveau_mot_de_passe_confirmation: nouveauMotDePasseConfirmation,
  });
  return response.data;
}

/**
 * Récupère les préférences de notification de l'utilisateur.
 * GET /api/user/notifications
 */
export async function getNotificationPrefs() {
  const response = await api.get("/user/notifications");
  return response.data;
}

/**
 * Met à jour les préférences de notification.
 * PUT /api/user/notifications
 * body: { email_demandes, email_messages, notifications_in_app }
 */
export async function updateNotificationPrefs(prefs) {
  const response = await api.put("/user/notifications", prefs);
  return response.data;
}

/**
 * Déconnecte tous les appareils sauf celui-ci.
 * POST /api/user/logout-all
 */
export async function logoutAllDevices() {
  const response = await api.post("/user/logout-all");
  return response.data;
}

/**
 * Supprime définitivement le compte de l'utilisateur connecté.
 * Le backend exige le mot de passe pour confirmer.
 * DELETE /api/user
 * body: { mot_de_passe }
 */
export async function deleteAccount(motDePasse) {
  const response = await api.delete("/user", { data: { mot_de_passe: motDePasse } });
  return response.data;
}