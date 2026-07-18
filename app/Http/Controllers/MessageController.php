<?php

namespace App\Http\Controllers;

use App\Models\DemandePrestation;
use App\Models\Message;
use App\Models\ProfilTalent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Construit l'URL affichable d'une photo — compatible URL absolue
     * (Cloudinary) et chemin de stockage local. Même logique que dans
     * TalentController/ProfilTalentController/AuthController.
     */
    private function resolvePhotoUrl(?string $photo): ?string
    {
        if (!$photo) return null;

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return asset('storage/' . $photo);
    }

    /**
     * Vérifie que l'utilisateur connecté fait bien partie de cette
     * conversation (soit le client, soit le talent concerné), et renvoie
     * la demande — ou abort(403/404).
     */
    private function resolveConversation(Request $request, $demandeId): DemandePrestation
    {
        $demande = DemandePrestation::with(['client', 'profilTalent.utilisateur'])->find($demandeId);

        abort_if(!$demande, 404, 'Conversation introuvable.');

        $user = $request->user();
        $estClient = $user->isClient() && $demande->client_id === $user->id;
        $estTalent = $user->isTalent() && $demande->profilTalent?->utilisateur_id === $user->id;

        abort_unless($estClient || $estTalent, 403, 'Vous n\'avez pas accès à cette conversation.');

        return $demande;
    }

    /**
     * Récupère un message et vérifie que l'utilisateur connecté a accès
     * à la conversation à laquelle il appartient.
     */
    private function resolveMessageAccess(Request $request, $messageId): Message
    {
        $message = Message::find($messageId);

        abort_if(!$message, 404, 'Message introuvable.');

        $this->resolveConversation($request, $message->demande_prestation_id);

        return $message;
    }

    /**
     * Liste des conversations du CLIENT connecté : une par demande de
     * prestation, avec le dernier message et le nombre de non-lus.
     * GET /api/client/conversations
     */
    public function indexClient(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $demandes = DemandePrestation::where('client_id', $request->user()->id)
            ->with(['profilTalent.utilisateur', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->withCount(['messages as non_lus_count' => function ($q) use ($request) {
                $q->where('lu', false)->where('expediteur_id', '!=', $request->user()->id);
            }])
            ->whereHas('messages')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $demandes->map(fn ($d) => $this->formatConversation($d, $request->user()->id)),
        ]);
    }

    /**
     * Liste des conversations du TALENT connecté.
     * GET /api/talent/conversations
     */
    public function indexTalent(Request $request)
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');

        $profil = $request->user()->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $demandes = DemandePrestation::where('profil_talent_id', $profil->id)
            ->with(['client', 'profilTalent', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->withCount(['messages as non_lus_count' => function ($q) use ($request) {
                $q->where('lu', false)->where('expediteur_id', '!=', $request->user()->id);
            }])
            ->whereHas('messages')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $demandes->map(fn ($d) => $this->formatConversation($d, $request->user()->id)),
        ]);
    }

    /**
     * Démarre une conversation avec un talent depuis sa page de profil,
     * sans passer par une demande de prestation formelle.
     * POST /api/client/conversations/start
     */
    public function start(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $validator = Validator::make($request->all(), [
            'profil_talent_id' => 'required|exists:profils_talents,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $clientId = $request->user()->id;
        $profilTalentId = $request->profil_talent_id;

        $demande = DemandePrestation::where('client_id', $clientId)
            ->where('profil_talent_id', $profilTalentId)
            ->latest()
            ->first();

        if (!$demande) {
            $profil = ProfilTalent::with('utilisateur')->find($profilTalentId);

            if (!$profil || $profil->utilisateur?->statut !== 'valide') {
                return response()->json(['message' => 'Ce talent n\'est plus disponible sur la plateforme.'], 404);
            }

            $demande = DemandePrestation::create([
                'client_id' => $clientId,
                'profil_talent_id' => $profilTalentId,
                'statut' => 'conversation',
                'message_initial' => 'Nouvelle conversation',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => ['conversation_id' => $demande->id],
        ]);
    }

    /**
     * Messages d'une conversation, du plus ancien au plus récent. Marque
     * automatiquement comme lus les messages envoyés par l'autre partie.
     * Filtre les messages masqués pour l'utilisateur connecté (supprimés
     * "pour moi" uniquement).
     * GET /api/conversations/{demande}/messages
     */
    public function show(Request $request, $demandeId)
    {
        $demande = $this->resolveConversation($request, $demandeId);
        $userId = $request->user()->id;

        Message::where('demande_prestation_id', $demande->id)
            ->where('expediteur_id', '!=', $userId)
            ->where('lu', false)
            ->update(['lu' => true]);

        $messages = Message::where('demande_prestation_id', $demande->id)
            ->orderBy('created_at')
            ->get()
            ->reject(function ($m) use ($userId) {
                if ($m->expediteur_id === $userId) {
                    return $m->supprime_expediteur;
                }
                return $m->supprime_destinataire;
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'conversation' => $this->formatConversation($demande, $userId, includeLastMessage: false),
                'messages' => $messages->map(fn ($m) => $this->formatMessage($m, $userId)),
            ],
        ]);
    }

    /**
     * Envoie un message dans une conversation existante.
     * POST /api/conversations/{demande}/messages
     */
    public function store(Request $request, $demandeId)
    {
        $demande = $this->resolveConversation($request, $demandeId);

        $validator = Validator::make($request->all(), [
            'contenu' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'demande_prestation_id' => $demande->id,
            'expediteur_id' => $request->user()->id,
            'contenu' => $request->contenu,
            'lu' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatMessage($message, $request->user()->id),
        ], 201);
    }

    /**
     * Modifie le contenu d'un message. Seul l'expéditeur peut modifier
     * son propre message, et uniquement s'il n'a pas été supprimé pour
     * tout le monde.
     * PATCH /api/messages/{id}
     */
    public function update(Request $request, $id)
    {
        $message = $this->resolveMessageAccess($request, $id);

        abort_unless($message->expediteur_id === $request->user()->id, 403, 'Vous ne pouvez modifier que vos propres messages.');
        abort_if($message->supprime_pour_tous, 422, 'Ce message a été supprimé.');

        $validator = Validator::make($request->all(), [
            'contenu' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message->update([
            'contenu' => $request->contenu,
            'modifie' => true,
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatMessage($message->fresh(), $request->user()->id),
        ]);
    }

    /**
     * Supprime un message.
     * - mode=moi  : masque le message uniquement pour l'utilisateur connecté.
     * - mode=tous : remplace le contenu par "Message supprimé" pour tout
     *   le monde. Réservé à l'expéditeur du message.
     * DELETE /api/messages/{id}?mode=moi|tous
     */
    public function destroy(Request $request, $id)
    {
        $message = $this->resolveMessageAccess($request, $id);
        $mode = $request->query('mode', 'moi');
        $userId = $request->user()->id;

        if ($mode === 'tous') {
            abort_unless($message->expediteur_id === $userId, 403, 'Seul l\'auteur peut supprimer pour tout le monde.');
            $message->update(['supprime_pour_tous' => true]);
        } else {
            if ($message->expediteur_id === $userId) {
                $message->update(['supprime_expediteur' => true]);
            } else {
                $message->update(['supprime_destinataire' => true]);
            }
        }

        return response()->json(['success' => true]);
    }

    private function formatConversation(DemandePrestation $d, int $currentUserId, bool $includeLastMessage = true): array
    {
        $dernier = $includeLastMessage ? $d->messages->first() : null;

        return [
            'id' => $d->id,
            'client_nom' => trim(($d->client->prenom ?? '') . ' ' . ($d->client->nom ?? '')),
            'client_photo' => $this->resolvePhotoUrl($d->client->photo ?? null),
            'talent_nom' => trim(
                ($d->profilTalent->utilisateur->prenom ?? '') . ' ' . ($d->profilTalent->utilisateur->nom ?? '')
            ),
            'talent_id' => $d->profilTalent->id ?? null,
            'talent_photo' => $this->resolvePhotoUrl($d->profilTalent->photo ?? null),
            'dernier_message' => $dernier?->supprime_pour_tous ? 'Message supprimé' : $dernier?->contenu,
            'dernier_message_at' => $dernier?->created_at,
            'non_lus' => $d->non_lus_count ?? 0,
        ];
    }

    private function formatMessage(Message $m, int $currentUserId): array
    {
        return [
            'id' => $m->id,
            'contenu' => $m->supprime_pour_tous ? null : $m->contenu,
            'supprime_pour_tous' => (bool) $m->supprime_pour_tous,
            'modifie' => (bool) $m->modifie,
            'lu' => (bool) $m->lu,
            'est_moi' => $m->expediteur_id === $currentUserId,
            'created_at' => $m->created_at,
        ];
    }
}