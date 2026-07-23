<?php

namespace App\Http\Controllers;

use App\Mail\NouveauTalentMail;
use App\Mail\OtpMail;
use App\Models\Utilisateur;
use App\Models\ProfilTalent;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * ✅ Génère et envoie un OTP par email
     */
    private function genererEtEnvoyerOtp(Utilisateur $utilisateur, string $type): void
    {
        Otp::where('utilisateur_id', $utilisateur->id)
            ->where('type', $type)
            ->delete();

        $code = (string) random_int(100000, 999999);

        Otp::create([
            'utilisateur_id' => $utilisateur->id,
            'code'           => $code,
            'type'           => $type,
            'expire_a'       => now()->addMinutes(10),
            'utilise'        => false,
            'tentatives'     => 0,
        ]);

        try {
            Mail::to($utilisateur->email)->queue(new OtpMail($code));
        } catch (\Exception $e) {}
    }

    /**
     * ✅ Notifie les admins qu'un nouveau talent attend validation
     */
    private function notifierAdminsNouveauTalent(Utilisateur $talent): void
    {
        $admins = Utilisateur::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->queue(new NouveauTalentMail($talent));
            } catch (\Exception $e) {}
        }
    }

    /**
     * ✅ Construit l'URL affichable d'une photo — compatible URL absolue
     * (Cloudinary, anciennes données) et chemin de stockage local.
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
     * ✅ INSCRIPTION
     */
    public function register(Request $request)
    {
        $rules = [
            'nom'          => 'required|string|max:100',
            'prenom'       => 'required|string|max:100',
            'email'        => 'required|email|unique:utilisateurs,email|regex:/^[\w.+-]+@gmail\.com$/i',
            'telephone'    => 'required|string|regex:/^[0-9]{8}$/',
            'mot_de_passe' => 'required|min:8|confirmed',
            'role'         => 'required|in:talent,client',
        ];

        if ($request->role === 'talent') {
            $rules['document_justificatif'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['categorie_id']          = 'required|exists:categories,id';
            $rules['ville']                 = 'required|string|max:100';
        }

        $validator = Validator::make($request->all(), $rules, [
            'email.regex'                    => 'L\'adresse e-mail doit être une adresse Gmail (@gmail.com).',
            'telephone.regex'                => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            'document_justificatif.required' => 'Le document justificatif est obligatoire pour les talents.',
            'categorie_id.required'          => 'Veuillez choisir une catégorie.',
            'categorie_id.exists'            => 'Catégorie invalide.',
            'ville.required'                 => 'Veuillez indiquer votre ville.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = DB::transaction(function () use ($request) {

            $documentPath = null;
            if ($request->hasFile('document_justificatif')) {
                $documentPath = $request->file('document_justificatif')
                    ->store('documents_justificatifs', 'public');
            }

            $utilisateur = Utilisateur::create([
                'nom'                   => $request->nom,
                'prenom'                => $request->prenom,
                'email'                 => $request->email,
                'telephone'             => $request->telephone,
                'mot_de_passe'          => Hash::make($request->mot_de_passe),
                'role'                  => $request->role,
                'is_verified'           => true,
                'document_justificatif' => $documentPath,
                'statut'                => $request->role === 'talent' ? 'en_attente' : 'actif',
                'categorie_id'          => $request->role === 'talent' ? $request->categorie_id : null,
                'ville'                 => $request->role === 'talent' ? $request->ville : null,
            ]);

            if ($request->role === 'talent') {
                ProfilTalent::create([
                    'utilisateur_id' => $utilisateur->id,
                    'disponibilite'  => false,
                    'vues'           => 0,
                ]);
            }

            return $utilisateur;
        });

        if ($utilisateur->role === 'talent') {
            $this->notifierAdminsNouveauTalent($utilisateur);
        }

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data'    => [
                'utilisateur' => $utilisateur,
                'token'       => $token,
                'redirect'    => 'login',
            ]
        ], 201);
    }

    /**
     * ✅ LOGIN → OTP par email
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::where('email', $request->email)->first();

        if (!$utilisateur) {
            return response()->json(['message' => 'Email introuvable'], 404);
        }

        if ($utilisateur->isAdmin()) {
            return response()->json(['message' => 'Email introuvable'], 404);
        }

        if ($utilisateur->isTalent()) {
            if ($utilisateur->statut !== 'valide') {
                $message = match ($utilisateur->statut) {
                    'rejete'    => 'Votre profil a été refusé. Motif : ' . ($utilisateur->motif_rejet ?? 'non précisé'),
                    'desactive' => 'Votre compte a été désactivé par un administrateur. Contactez le support.',
                    default     => 'Votre compte est en attente de validation par un administrateur.',
                };

                return response()->json(['message' => $message], 403);
            }
        }

        $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

        return response()->json([
            'success'        => true,
            'message'        => 'OTP envoyé',
            'utilisateur_id' => $utilisateur->id,
        ]);
    }

    /**
     * ✅ VÉRIFICATION OTP
     */
    public function verifyLoginOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'code'           => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::with('profilTalent')->find($request->utilisateur_id);

        $otp = Otp::where('utilisateur_id', $utilisateur->id)
            ->where('type', 'connexion')
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Code invalide'], 422);
        }

        // ⛔ Bloqué après 2 tentatives incorrectes
        if ($otp->estBloque()) {
            $secondes = $otp->secondesRestantes();
            return response()->json([
                'message'     => "Trop de tentatives. Réessayez dans {$secondes} secondes.",
                'retry_after' => $secondes,
            ], 429);
        }

        // Code incorrect
        if ($otp->code !== $request->code) {
            $otp->tentatives++;

            if ($otp->tentatives >= 2) {
                $otp->bloque_jusqua = now()->addSeconds(30);
            }

            $otp->save();

            return response()->json(['message' => 'Code invalide'], 422);
        }

        // Code expiré
        if ($otp->estExpire()) {
            return response()->json(['message' => 'Code expiré'], 422);
        }

        // ✅ Code correct — nettoyage
        Otp::where('utilisateur_id', $utilisateur->id)->delete();

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        // Redirection selon rôle et état du profil
        $redirect = '/';
        if ($utilisateur->isTalent()) {
            $profil = $utilisateur->profilTalent;
            $redirect = ($profil && $profil->estComplet()) ? 'talent/dashboard' : 'talent/profil/creer';
        } elseif ($utilisateur->isAdmin()) {
            $redirect = 'admin';
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'utilisateur' => $utilisateur,
                'token'       => $token,
                'redirect'    => $redirect,
            ]
        ]);
    }

    /**
     * ✅ RENVOI OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'utilisateur_id' => 'required|exists:utilisateurs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::find($request->utilisateur_id);

        if ($utilisateur->isAdmin()) {
            return response()->json(['message' => 'Email introuvable'], 404);
        }

        $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

        return response()->json([
            'success' => true,
            'message' => 'Nouveau code envoyé',
        ]);
    }

    /**
     * ✅ UTILISATEUR CONNECTÉ
     * Résout la photo du compte (utilisateurs.photo — clients/admins) ET
     * celle du profil talent (profils_talents.photo — talents), séparément,
     * chacune compatible URL absolue (Cloudinary) ou chemin local.
     */
    public function me(Request $request)
    {
        $utilisateur = $request->user()->load('profilTalent');
        $profil = $utilisateur->profilTalent;

        $utilisateurData = $utilisateur->toArray();
        $utilisateurData['photo'] = $this->resolvePhotoUrl($utilisateur->photo);

        $utilisateurData['profilTalent'] = $profil
            ? array_merge($profil->toArray(), ['photo' => $this->resolvePhotoUrl($profil->photo)])
            : null;

        return response()->json($utilisateurData);
    }

    /**
     * ✅ MISE À JOUR DU PROFIL (infos de base + photo de compte + mot de passe)
     *
     * La photo ici est celle du COMPTE (utilisateurs.photo) — pertinente pour
     * un client ou un admin. Le talent a sa propre photo "professionnelle"
     * sur profils_talents.photo, gérée par ProfilTalentController, pas ici.
     *
     * ⚠️ C'est aussi CE endpoint qui gère le changement de mot de passe
     * (page Paramètres) : envoyer mot_de_passe_actuel + nouveau_mot_de_passe
     * + nouveau_mot_de_passe_confirmation, sans toucher aux autres champs.
     */
    public function update(Request $request)
    {
        $utilisateur = $request->user();

        $rules = [
            'nom'       => 'sometimes|required|string|max:100',
            'prenom'    => 'sometimes|required|string|max:100',
            'telephone' => 'sometimes|required|string|regex:/^[0-9]{8}$/',
            'photo'     => 'nullable|file|image|mimes:jpeg,jpg,png|max:10240', // 10 Mo
        ];

        $changePassword = $request->filled('nouveau_mot_de_passe');

        if ($changePassword) {
            $rules['mot_de_passe_actuel']  = 'required|string';
            $rules['nouveau_mot_de_passe'] = 'required|string|min:8|confirmed';
        }

        $validator = Validator::make($request->all(), $rules, [
            'telephone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
            'photo.image'     => 'Le fichier doit être une image (JPG ou PNG).',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($changePassword && !Hash::check($request->mot_de_passe_actuel, $utilisateur->mot_de_passe)) {
            return response()->json([
                'errors' => ['mot_de_passe_actuel' => ['Mot de passe actuel incorrect.']],
            ], 422);
        }

        $utilisateur->fill($request->only(['nom', 'prenom', 'telephone']));

        if ($request->hasFile('photo')) {
            // Supprime l'ancienne photo locale si elle existe (ignore les
            // anciennes URLs Cloudinary, non supprimables via ce disque).
            if ($utilisateur->photo && !str_starts_with($utilisateur->photo, 'http')) {
                Storage::disk('public')->delete($utilisateur->photo);
            }

            $utilisateur->photo = $request->file('photo')->store('photos_utilisateurs', 'public');
        }

        if ($changePassword) {
            $utilisateur->mot_de_passe = Hash::make($request->nouveau_mot_de_passe);
        }

        $utilisateur->save();

        $utilisateur = $utilisateur->fresh()->load('profilTalent');
        $data = $utilisateur->toArray();
        $data['photo'] = $this->resolvePhotoUrl($utilisateur->photo);

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }

    /**
     * ✅ SUPPRESSION DU COMPTE
     */
    public function destroy(Request $request)
    {
        $utilisateur = $request->user();

        if ($utilisateur->isAdmin()) {
            return response()->json([
                'message' => 'Un compte administrateur ne peut pas être supprimé depuis cette interface.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'mot_de_passe' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->mot_de_passe, $utilisateur->mot_de_passe)) {
            return response()->json([
                'errors' => ['mot_de_passe' => ['Mot de passe incorrect.']],
            ], 422);
        }

        DB::transaction(function () use ($utilisateur) {
            $utilisateur->tokens()->delete();
            $utilisateur->otps()->delete();
            $utilisateur->notificationsInternes()->delete();

            if ($utilisateur->isTalent()) {
                $profil = $utilisateur->profilTalent;
                if ($profil) {
                    $profil->portfolios()->delete();
                    $profil->avis()->delete();
                    $profil->favoris()->delete();
                    $profil->demandesPrestation()->delete();
                    $profil->delete();
                }
            }

            if ($utilisateur->isClient()) {
                $utilisateur->demandesPrestation()->delete();
                $utilisateur->favoris()->delete();
                $utilisateur->avisDonnes()->delete();
            }

            $utilisateur->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Compte supprimé avec succès.',
        ]);
    }

    /**
     * ✅ PRÉFÉRENCES DE NOTIFICATION (page Paramètres)
     * Stockées en JSON sur utilisateurs.preferences_notifications.
     * Si l'utilisateur n'en a jamais défini, on renvoie des valeurs par
     * défaut (tout activé) sans forcer d'écriture en base.
     */
    public function getNotificationPrefs(Request $request)
    {
        $defaults = [
            'email_demandes'       => true,
            'email_messages'       => true,
            'notifications_in_app' => true,
        ];

        $utilisateur = $request->user();
        $prefs = $utilisateur->preferences_notifications
            ? array_merge($defaults, $utilisateur->preferences_notifications)
            : $defaults;

        return response()->json([
            'success' => true,
            'data'    => $prefs,
        ]);
    }

    /**
     * ✅ MISE À JOUR DES PRÉFÉRENCES DE NOTIFICATION
     */
    public function updateNotificationPrefs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email_demandes'       => 'required|boolean',
            'email_messages'       => 'required|boolean',
            'notifications_in_app' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = $request->user();
        $utilisateur->preferences_notifications = $request->only([
            'email_demandes', 'email_messages', 'notifications_in_app',
        ]);
        $utilisateur->save();

        return response()->json([
            'success' => true,
            'data'    => $utilisateur->preferences_notifications,
        ]);
    }

    /**
     * ✅ DÉCONNEXION DE TOUS LES AUTRES APPAREILS
     * Révoque tous les tokens Sanctum SAUF celui utilisé pour cette requête,
     * afin de ne pas déconnecter la session en cours.
     */
    public function logoutAllDevices(Request $request)
    {
        $utilisateur = $request->user();
        $currentTokenId = $utilisateur->currentAccessToken()->id;

        $utilisateur->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tous les autres appareils ont été déconnectés.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }
}