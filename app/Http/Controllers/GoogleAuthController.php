<?php

namespace App\Http\Controllers;

use App\Mail\OtpMail;
use App\Models\Utilisateur;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * ✅ Même logique que AuthController::genererEtEnvoyerOtp (privée
     * là-bas, donc dupliquée ici).
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
            Log::error('Échec envoi OTP (Google)', [
                'utilisateur_id' => $utilisateur->id,
                'email'          => $utilisateur->email,
                'erreur'         => $e->getMessage(),
            ]);
        }
    }

    /**
     * ✅ Redirige vers Google. Pas de rôle à passer : Google ne sert plus
     * qu'à CONNECTER un compte déjà existant, pas à en créer.
     */
    public function redirect(Request $request)
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * ✅ Retour de Google — connexion uniquement, jamais de création
     * de compte automatique.
     */
    public function callback(Request $request)
    {
        $frontendUrl = env('FRONTEND_URL');

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            Log::error('Échec authentification Google', ['erreur' => $e->getMessage()]);
            return redirect("{$frontendUrl}/login?error=google_failed");
        }

        $utilisateur = Utilisateur::where('email', $googleUser->getEmail())->first();

        // ✅ Email inconnu dans notre base → on ne crée RIEN, on invite à
        // s'inscrire via le formulaire classique.
        if (!$utilisateur) {
            return redirect("{$frontendUrl}/login?error=email_not_found");
        }

        if ($utilisateur->isAdmin()) {
            return redirect("{$frontendUrl}/login?error=google_failed");
        }

        // Compte classique (OTP) → on relance le flow OTP normal
        if (is_null($utilisateur->provider)) {

            if ($utilisateur->isTalent() && $utilisateur->statut !== 'valide') {
                $errorMap = [
                    'rejete'    => 'talent_rejected',
                    'desactive' => 'talent_disabled',
                ];
                $error = $errorMap[$utilisateur->statut] ?? 'talent_pending';
                return redirect("{$frontendUrl}/login?error={$error}");
            }

            $this->genererEtEnvoyerOtp($utilisateur, 'connexion');

            return redirect("{$frontendUrl}/login?otp_sent=1&utilisateur_id={$utilisateur->id}");
        }

        // Compte déjà lié à Google → connexion directe (Google a déjà authentifié)
        if ($utilisateur->isTalent() && !in_array($utilisateur->statut, ['valide', 'en_attente'])) {
            $errorMap = [
                'rejete'    => 'talent_rejected',
                'desactive' => 'talent_disabled',
            ];
            return redirect("{$frontendUrl}/login?error=" . ($errorMap[$utilisateur->statut] ?? 'talent_pending'));
        }

        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        $redirect = '/';
        if ($utilisateur->isTalent()) {
            $profil = $utilisateur->load('profilTalent')->profilTalent;
            $redirect = ($profil && $profil->estComplet()) ? 'talent/dashboard' : 'talent/profil/creer';
        } elseif ($utilisateur->isClient()) {
            $redirect = 'client/dashboard';
        }

        return redirect("{$frontendUrl}/auth/callback?token={$token}&redirect={$redirect}");
    }
}