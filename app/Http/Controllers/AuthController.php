<?php

namespace App\Http\Controllers;

use App\Mail\NouveauTalentMail;
use App\Mail\OtpMail;
use App\Models\Utilisateur;
use App\Models\ProfilTalent;
use App\Models\Otp;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Abonnement;
use Carbon\Carbon;

class AuthController extends Controller
{
    private function cloudinary(): CloudinaryService
    {
        return app(CloudinaryService::class);
    }

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
        } catch (\Exception $e) {
            Log::error('Échec envoi OTP', [
                'utilisateur_id' => $utilisateur->id,
                'email'          => $utilisateur->email,
                'type'           => $type,
                'erreur'         => $e->getMessage(),
            ]);
        }
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
            } catch (\Exception $e) {
                Log::error('Échec notification admin nouveau talent', [
                    'admin_id' => $admin->id,
                    'talent_id' => $talent->id,
                    'erreur'   => $e->getMessage(),
                ]);
            }
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
            'telephone'    => 'required|string|regex:/^[792][0-9]{7}$/',
            'mot_de_passe' => [
                'required',
                'string',
                'size:8',
                'regex:/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8}$/',
                'confirmed',
            ],
            'role'         => 'required|in:talent,client',
        ];

        if ($request->role === 'talent') {
            $rules['document_justificatif_url'] = ['required', 'url', 'starts_with:https://res.cloudinary.com/'];
            $rules['categorie_id']              = 'required|exists:categories,id';
            $rules['ville']                     = 'required|string|max:100';
            $rules['plan']                      = 'required|in:gratuit,payant';
        }

        $validator = Validator::make($request->all(), $rules, [
            'email.regex'                        => 'L\'adresse e-mail doit être une adresse Gmail (@gmail.com).',
            'telephone.regex'                    => 'Le numéro doit être un numéro togolais valide (8 chiffres, commençant par 7, 9 ou 2).',
            'mot_de_passe.size'                  => 'Le mot de passe doit contenir exactement 8 caractères.',
            'mot_de_passe.regex'                 => 'Le mot de passe doit contenir au moins une lettre, un chiffre et un caractère spécial.',
            'mot_de_passe.confirmed'             => 'Les mots de passe ne correspondent pas.',
            'document_justificatif_url.required' => 'Le document justificatif est obligatoire pour les talents.',
            'document_justificatif_url.url'      => 'Document justificatif invalide.',
            'categorie_id.required'              => 'Veuillez choisir une catégorie.',
            'categorie_id.exists'                => 'Catégorie invalide.',
            'ville.required'                     => 'Veuillez indiquer votre ville.',
            'plan.required'                      => 'Veuillez choisir un plan d\'abonnement.',
            'plan.in'                            => 'Plan d\'abonnement invalide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $documentUrl = $request->role === 'talent'
            ? $request->input('document_justificatif_url')
            : null;

        $utilisateur = DB::transaction(function () use ($request, $documentUrl) {

            $estTalent  = $request->role === 'talent';
            $planChoisi = $estTalent ? $request->input('plan') : null;

            $finEssaiGratuit = ($estTalent && $planChoisi === 'gratuit')
                ? Carbon::now()->addMonth()
                : null;

            $utilisateur = Utilisateur::create([
                'nom'                   => $request->nom,
                'prenom'                => $request->prenom,
                'email'                 => $request->email,
                'telephone'             => $request->telephone,
                'mot_de_passe'          => Hash::make($request->mot_de_passe),
                'role'                  => $request->role,
                'is_verified'           => true,
                'document_justificatif' => $documentUrl,
                'statut'                => $estTalent ? 'en_attente' : 'actif',
                'categorie_id'          => $estTalent ? $request->categorie_id : null,
                'ville'                 => $estTalent ? $request->ville : null,
                'abonnement_expire_le'  => $finEssaiGratuit,
                'plan_choisi'           => $estTalent ? $planChoisi : null,
            ]);

            if ($estTalent) {
                ProfilTalent::create([
                    'utilisateur_id' => $utilisateur->id,
                    'disponibilite'  => false,
                    'vues'           => 0,
                ]);

                if ($planChoisi === 'gratuit') {
                    Abonnement::create([
                        'utilisateur_id' => $utilisateur->id,
                        'statut'         => 'essai_gratuit',
                        'date_debut'     => now(),
                        'date_fin'       => $finEssaiGratuit,
                    ]);
                } else {
                    Abonnement::create([
                        'utilisateur_id' => $utilisateur->id,
                        'statut'         => 'en_attente_paiement',
                        'date_debut'     => now(),
                        'date_fin'       => null,
                    ]);
                }
            }

            return $utilisateur;
        });

        if ($utilisateur->role === 'talent') {
            dispatch(function () use ($utilisateur) {
                $this->notifierAdminsNouveauTalent($utilisateur);
            })->afterResponse();
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'utilisateur' => $utilisateur,
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

        if ($otp->estBloque()) {
            $secondes = $otp->secondesRestantes();
            return response()->json([
                'message'     => "Trop de tentatives. Réessayez dans {$secondes} secondes.",
                'retry_after' => $secondes,
            ], 429);
        }

        if ($otp->code !== $request->code) {
            $otp->tentatives++;

            if ($otp->tentatives >= 2) {
                $otp->bloque_jusqua = now()->addSeconds(30);
            }

            $otp->save();

            return response()->json(['message' => 'Code invalide'], 422);
        }

        if ($otp->estExpire()) {
            return response()->json(['message' => 'Code expiré'], 422);
        }

        Otp::where('utilisateur_id', $utilisateur->id)->delete();

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        $redirect = '/';
        if ($utilisateur->isTalent()) {
            $profil = $utilisateur->profilTalent;
            $redirect = ($profil && $profil->estComplet()) ? 'talent/dashboard' : 'talent/profil/creer';
        } elseif ($utilisateur->isAdmin()) {
            $redirect = 'admin';
        }

        $utilisateurData = $utilisateur->toArray();
        $utilisateurData['photo'] = $this->resolvePhotoUrl($utilisateur->photo);

        if ($utilisateur->profilTalent) {
            $utilisateurData['profilTalent'] = array_merge(
                $utilisateur->profilTalent->toArray(),
                ['photo' => $this->resolvePhotoUrl($utilisateur->profilTalent->photo)]
            );
        }

        if ($utilisateur->isTalent()) {
            // ✅ On cherche l'abonnement RÉELLEMENT en cours de validité
            // (actif ou essai_gratuit, avec une date de fin encore dans le
            // futur), pas simplement le plus récent créé — sinon une tentative
            // de paiement ratée/abandonnée après un abonnement déjà payé
            // masquerait à tort le vrai statut "actif".
            $abonnementValide = $utilisateur->abonnements()
                ->where('date_fin', '>', now())
                ->whereIn('statut', ['actif', 'essai_gratuit'])
                ->orderByDesc('date_fin')
                ->first();

            $utilisateurData['abonnement_statut'] = $abonnementValide?->statut
                ?? $utilisateur->abonnements()->latest()->first()?->statut;
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'utilisateur' => $utilisateurData,
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

        if ($utilisateur->isTalent()) {
            // ✅ On cherche l'abonnement RÉELLEMENT en cours de validité
            // (actif ou essai_gratuit, avec une date de fin encore dans le
            // futur), pas simplement le plus récent créé — sinon une tentative
            // de paiement ratée/abandonnée après un abonnement déjà payé
            // masquerait à tort le vrai statut "actif".
            $abonnementValide = $utilisateur->abonnements()
                ->where('date_fin', '>', now())
                ->whereIn('statut', ['actif', 'essai_gratuit'])
                ->orderByDesc('date_fin')
                ->first();

            $utilisateurData['abonnement_statut'] = $abonnementValide?->statut
                ?? $utilisateur->abonnements()->latest()->first()?->statut;
        }

        return response()->json($utilisateurData);
    }

    /**
     * ✅ MISE À JOUR DU PROFIL (infos de base + photo de compte + mot de passe)
     */
    public function update(Request $request)
    {
        $utilisateur = $request->user();

        $rules = [
            'nom'       => 'sometimes|required|string|max:100',
            'prenom'    => 'sometimes|required|string|max:100',
            'telephone' => 'sometimes|required|string|regex:/^[0-9]{8}$/',
            'photo'     => 'nullable|file|image|mimes:jpeg,jpg,png|max:10240',
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
            if ($utilisateur->photo_public_id) {
                $this->cloudinary()->delete($utilisateur->photo_public_id, 'image');
            }

            try {
                $upload = $this->cloudinary()->upload(
                    $request->file('photo'),
                    'talenttogo/photos_utilisateurs',
                    'image'
                );
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => 'Échec de l\'envoi de la photo. Réessayez ou contactez le support.',
                    'debug' => config('app.debug') ? $e->getMessage() : null,
                ], 503);
            }

            $utilisateur->photo = $upload['url'];
            $utilisateur->photo_public_id = $upload['public_id'];
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