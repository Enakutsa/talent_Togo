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

class AuthController extends Controller
{
    /**
     * ✅ Génère et envoie un OTP par email
     */
    private function genererEtEnvoyerOtp(Utilisateur $utilisateur, string $type): void
    {
        Otp::where('utilisateur_id', $utilisateur->id)
            ->where('type', $type)
            ->where('utilise', false)
            ->update(['utilise' => true]);

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
     * ✅ INSCRIPTION
     *
     * Champs communs (Talent + Client) :
     *   nom, prenom, email, telephone, mot_de_passe, role
     *
     * Champs supplémentaires Talent uniquement (tous stockés dans utilisateurs) :
     *   document_justificatif, categorie_id, ville
     *
     * Après inscription :
     *   - Talent  → statut "en_attente", ProfilTalent (vide) créé pour le reste du profil
     *   - Client  → statut "actif", pas de ProfilTalent
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

            // Créer le ProfilTalent (categorie/ville vivent désormais sur Utilisateur)
            // Le reste — bio, tarifs, photo, portfolio — sera complété plus tard
            if ($request->role === 'talent') {
                ProfilTalent::create([
                    'utilisateur_id' => $utilisateur->id,
                    'disponibilite'  => false,
                    'vues'           => 0,
                ]);
            }

            return $utilisateur;
        });

        // Notifie les admins qu'un talent attend validation
        if ($utilisateur->role === 'talent') {
            $this->notifierAdminsNouveauTalent($utilisateur);
        }

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data'    => [
                'utilisateur' => $utilisateur,
                'token'       => $token,
                'redirect'    => $utilisateur->role === 'talent' ? 'login' : 'login',
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

        // Bloque la connexion d'un talent non encore validé ou désactivé
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
            ->where('code', $request->code)
            ->where('utilise', false)
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Code invalide'], 422);
        }

        if ($otp->tentatives >= 5) {
            return response()->json(['message' => 'Trop de tentatives'], 429);
        }

        $otp->increment('tentatives');

        if ($otp->expire_a < now()) {
            return response()->json(['message' => 'Code expiré'], 422);
        }

        $otp->update(['utilise' => true]);
        Otp::where('utilisateur_id', $utilisateur->id)->delete();

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        // Détermine la redirection selon le rôle et l'état du profil
        $redirect = 'dashboard';
        if ($utilisateur->isTalent()) {
            $profil = $utilisateur->profilTalent;
            $redirect = ($profil && $profil->estComplet()) ? 'talent/dashboard' : 'talent/profil/creer';
        } elseif ($utilisateur->isClient()) {
            $redirect = 'dashboard';
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

        $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

        return response()->json([
            'success' => true,
            'message' => 'Nouveau code envoyé',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('profilTalent'));
    }

    /**
     * ✅ MISE À JOUR DU PROFIL (infos de base uniquement)
     *
     * nom, prenom, telephone → modifiables directement
     * mot de passe           → modifiable en fournissant l'ancien + le nouveau
     *
     * L'email n'est pas modifiable ici (impacterait l'auth par OTP).
     * Les champs spécifiques au profil Talent (categorie, ville, bio, tarifs,
     * photo, portfolio) relèvent d'un ProfilTalentController dédié.
     */
    public function update(Request $request)
    {
        $utilisateur = $request->user();

        $rules = [
            'nom'       => 'sometimes|required|string|max:100',
            'prenom'    => 'sometimes|required|string|max:100',
            'telephone' => 'sometimes|required|string|regex:/^[0-9]{8}$/',
        ];

        $changePassword = $request->filled('nouveau_mot_de_passe');

        if ($changePassword) {
            $rules['mot_de_passe_actuel']  = 'required|string';
            $rules['nouveau_mot_de_passe'] = 'required|string|min:8|confirmed';
        }

        $validator = Validator::make($request->all(), $rules, [
            'telephone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
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

        if ($changePassword) {
            $utilisateur->mot_de_passe = Hash::make($request->nouveau_mot_de_passe);
        }

        $utilisateur->save();

        return response()->json([
            'success' => true,
            'data'    => $utilisateur->fresh()->load('profilTalent'),
        ]);
    }

    /**
     * ✅ SUPPRESSION DU COMPTE
     *
     * Protégée par la saisie du mot de passe. Un admin ne peut pas
     * se supprimer lui-même via cette route (géré depuis Filament).
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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }
}