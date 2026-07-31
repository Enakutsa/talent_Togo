<?php

namespace App\Http\Controllers;

use App\Mail\NouveauTalentMail;
use App\Mail\OtpMail;
use App\Models\Utilisateur;
use App\Models\ProfilTalent;
use App\Models\Otp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * ✅ Même logique que AuthController::genererEtEnvoyerOtp — dupliquée
     * ici car privée dans AuthController. Si tu la rends publique/statique
     * là-bas plus tard, remplace cet appel pour éviter la duplication.
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

    private function notifierAdminsNouveauTalent(Utilisateur $talent): void
    {
        $admins = Utilisateur::where('role', 'admin')->get();

        foreach ($admins as $admin) {
            try {
                Mail::to($admin->email)->queue(new NouveauTalentMail($talent));
            } catch (\Exception $e) {
                Log::error('Échec notification admin nouveau talent (Google)', [
                    'admin_id'  => $admin->id,
                    'talent_id' => $talent->id,
                    'erreur'    => $e->getMessage(),
                ]);
            }
        }
    }

    public function redirect(Request $request, string $role = 'client')
    {
        if (!in_array($role, ['client', 'talent'])) {
            abort(404);
        }

        session(['oauth_role' => $role]);

        return Socialite::driver('google')->redirect();
    }

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

        // ✅ Cas 1 : email déjà utilisé pour un compte classique (OTP) →
        // au lieu de bloquer, on relance le flow OTP normal comme un login
        // classique. L'utilisateur passe par la même vérification de
        // sécurité, mais démarrée automatiquement via Google.
        if ($utilisateur && is_null($utilisateur->provider)) {

            if ($utilisateur->isAdmin()) {
                return redirect("{$frontendUrl}/login?error=google_failed");
            }

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

        // Cas 2 : nouveau compte Google
        if (!$utilisateur) {
            $role = session('oauth_role', 'client');
            session()->forget('oauth_role');

            $nomComplet = explode(' ', $googleUser->getName(), 2);
            $prenom = $nomComplet[0] ?? $googleUser->getName();
            $nom    = $nomComplet[1] ?? '';

            $utilisateur = DB::transaction(function () use ($googleUser, $role, $nom, $prenom) {
                $u = Utilisateur::create([
                    'nom'         => $nom ?: $prenom,
                    'prenom'      => $prenom,
                    'email'       => $googleUser->getEmail(),
                    'google_id'   => $googleUser->getId(),
                    'provider'    => 'google',
                    'photo'       => $googleUser->getAvatar(),
                    'role'        => $role,
                    'is_verified' => true,
                    'statut'      => $role === 'talent' ? 'en_attente' : 'actif',
                ]);

                if ($role === 'talent') {
                    ProfilTalent::create([
                        'utilisateur_id' => $u->id,
                        'disponibilite'  => false,
                        'vues'           => 0,
                    ]);
                }

                return $u;
            });
        }

        // Cas 3 : compte Google existant → connexion directe (pas d'OTP,
        // Google a déjà authentifié)
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
        } elseif ($utilisateur->isAdmin()) {
            $redirect = 'admin';
        } elseif ($utilisateur->isClient()) {
            $redirect = 'client/dashboard';
        }

        return redirect("{$frontendUrl}/auth/callback?token={$token}&redirect={$redirect}");
    }
}