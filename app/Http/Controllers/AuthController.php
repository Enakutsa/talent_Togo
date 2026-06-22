<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * ✅ Génère un code OTP et l'envoie par email
     */
    private function genererEtEnvoyerOtp(Utilisateur $utilisateur, string $type): void
    {
        // 🔥 Invalider anciens OTP
        Otp::where('utilisateur_id', $utilisateur->id)
            ->where('type', $type)
            ->where('utilise', false)
            ->update(['utilise' => true]);

        // 🔥 Génération code sécurisé
        $code = (string) random_int(100000, 999999);

        // 🔥 Enregistrement OTP
        Otp::create([
            'utilisateur_id' => $utilisateur->id,
            'code' => $code,
            'type' => $type,
            'expire_a' => now()->addMinutes(10),
            'utilise' => false,
            'tentatives' => 0 // ⚠️ ajouter ce champ dans ta table
        ]);

        // 🔥 Envoi email sécurisé
        try {
            Mail::raw(
                "Votre code TalentTogo : {$code} (valide 10 minutes)",
                function ($message) use ($utilisateur) {
                    $message->to($utilisateur->email)
                        ->subject('Code OTP TalentTogo');
                }
            );
        } catch (\Exception $e) {
            // ⚠️ Log possible ici
        }
    }

    /**
     * ✅ INSCRIPTION
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:utilisateurs,email',
            'mot_de_passe' => 'required|min:8|confirmed',
            'role' => 'required|in:talent,client',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'mot_de_passe' => Hash::make($request->mot_de_passe),
            'role' => $request->role,
            'is_verified' => true,
        ]);

        $token = $utilisateur->createToken('auth_token', ['*'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Compte créé avec succès',
            'data' => [
                'utilisateur' => $utilisateur,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * ✅ LOGIN (étape 1)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::where('email', $request->email)->first();

        if (!$utilisateur || !Hash::check($request->mot_de_passe, $utilisateur->mot_de_passe)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

        return response()->json([
            'success' => true,
            'message' => 'OTP envoyé',
            'utilisateur_id' => $utilisateur->id
        ]);
    }

    /**
     * ✅ LOGIN (étape 2 : vérification OTP)
     */
    public function verifyLoginOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'utilisateur_id' => 'required|exists:utilisateurs,id',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = Utilisateur::find($request->utilisateur_id);

        if (!$utilisateur) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $otp = Otp::where('utilisateur_id', $utilisateur->id)
            ->where('type', 'connexion')
            ->where('code', $request->code)
            ->where('utilise', false)
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Code invalide'], 422);
        }

        // 🔥 Protection brute force
        if ($otp->tentatives >= 5) {
            return response()->json(['message' => 'Trop de tentatives'], 429);
        }

        $otp->increment('tentatives');

        // 🔥 Vérification expiration
        if ($otp->expire_a < now()) {
            return response()->json(['message' => 'Code expiré'], 422);
        }

        // ✅ Marquer utilisé + supprimer les autres
        $otp->update(['utilise' => true]);
        Otp::where('utilisateur_id', $utilisateur->id)->delete();

        $token = $utilisateur->createToken('auth_token', ['*'])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'utilisateur' => $utilisateur,
                'token' => $token
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
            'message' => 'Nouveau code envoyé'
        ]);
    }

    /**
     * ✅ Récupérer utilisateur connecté
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * ✅ LOGOUT
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté']);
    }

    /**
     * ✅ UPDATE USER
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:100',
            'prenom' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:utilisateurs,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($validator->validated());

        return response()->json([
            'message' => 'Mis à jour',
            'utilisateur' => $user
        ]);
    }

    /**
     * ✅ DELETE USER
     */
    public function destroy(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé']);
    }
}