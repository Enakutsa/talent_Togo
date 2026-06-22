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
     * ✅ Génère OTP
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
            'code' => $code,
            'type' => $type,
            'expire_a' => now()->addMinutes(10),
            'utilise' => false,
            'tentatives' => 0
        ]);

        try {
            Mail::raw(
                "Votre code TalentTogo : {$code} (valide 10 minutes)",
                function ($message) use ($utilisateur) {
                    $message->to($utilisateur->email)
                        ->subject('Code OTP TalentTogo');
                }
            );
        } catch (\Exception $e) {}
    }

    /**
     * ✅ INSCRIPTION (ON GARDE)
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

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'utilisateur' => $utilisateur,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * ✅ LOGIN → EMAIL SEULEMENT + OTP
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

        // ✅ envoie OTP
        $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

        return response()->json([
            'success' => true,
            'message' => 'OTP envoyé',
            'utilisateur_id' => $utilisateur->id
        ]);
    }

    /**
     * ✅ VERIFY OTP
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

        return response()->json([
            'success' => true,
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

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté']);
    }
}
