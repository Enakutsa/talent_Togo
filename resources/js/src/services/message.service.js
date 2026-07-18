import api from "./api";

/**
 * Liste des conversations du client connecté.
 * GET /api/client/conversations
 */
export async function getConversationsClient() {
  const response = await api.get("/client/conversations");
  return response.data;
}

/**
 * Liste des conversations du talent connecté.
 * GET /api/talent/conversations
 */
export async function getConversationsTalent() {
  const response = await api.get("/talent/conversations");
  return response.data;
}

/**
 * Démarre (ou récupère) une conversation avec un talent depuis sa page
 * de profil. Renvoie { conversation_id }.
 * POST /api/client/conversations/start
 */
export async function startConversation(profilTalentId) {
  const response = await api.post("/client/conversations/start", {
    profil_talent_id: profilTalentId,
  });
  return response.data;
}

/**
 * Messages d'une conversation (marque les messages reçus comme lus).
 * GET /api/conversations/:id/messages
 */
export async function getMessages(conversationId) {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
}

/**
 * Envoie un message dans une conversation.
 * POST /api/conversations/:id/messages
 */
export async function sendMessage(conversationId, contenu) {
  const response = await api.post(`/conversations/${conversationId}/messages`, { contenu });
  return response.data;
}

export const updateMessage = async (id, contenu) => {
  const res = await api.patch(`/messages/${id}`, { contenu });
  return res.data;
};

export const deleteMessage = async (id, mode = "moi") => {
  const res = await api.delete(`/messages/${id}`, { params: { mode } });
  return res.data;
};