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
            Mail::to($utilisateur->email)->queue(new OtpMail($code));
        } catch (\Exception $e) {}
    }

    /**
     * ✅ Envoie un email à tous les administrateurs.
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
     * Si role = talent : crée aussi le ProfilTalent (catégorie, ville, tarifs, bio, document, photo).
     */
    public function register(Request $request)
    {
        $rules = [
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:utilisateurs,email|regex:/^[\w.+-]+@gmail\.com$/i',
            'telephone' => 'required|string|regex:/^[0-9]{8}$/',
            'mot_de_passe' => 'required|min:8|confirmed',
            'role' => 'required|in:talent,client',
        ];

        if ($request->role === 'talent') {
            $rules['categorie_id'] = 'required|exists:categories,id';
            $rules['ville'] = 'required|string|max:100';
            $rules['tarif_min'] = 'nullable|numeric|min:0|max:99999999';
            $rules['tarif_max'] = 'nullable|numeric|min:0|max:99999999|gte:tarif_min';
            $rules['biographie'] = 'nullable|string|max:1000';
            $rules['document_justificatif'] = 'required|file|mimes:pdf,jpg,jpeg,png|max:5120';
            $rules['photo'] = 'nullable|image|mimes:jpg,jpeg,png|max:3072'; // 3 Mo
        }

        $validator = Validator::make($request->all(), $rules, [
            'email.regex' => 'L\'adresse e-mail doit obligatoirement être une adresse Gmail (@gmail.com).',
            'telephone.regex' => 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $utilisateur = DB::transaction(function () use ($request) {
            $utilisateur = Utilisateur::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'mot_de_passe' => Hash::make($request->mot_de_passe),
                'role' => $request->role,
                'is_verified' => true,
            ]);

            if ($request->role === 'talent') {
                $documentPath = null;
                $photoPath = null;

                if ($request->hasFile('document_justificatif')) {
                    $documentPath = $request->file('document_justificatif')
                        ->store('documents_justificatifs', 'public');
                }

                if ($request->hasFile('photo')) {
                    $photoPath = $request->file('photo')
                        ->store('photos_talents', 'public');
                }

                ProfilTalent::create([
                    'utilisateur_id' => $utilisateur->id,
                    'categorie_id' => $request->categorie_id,
                    'ville' => $request->ville,
                    'tarif_min' => $request->tarif_min,
                    'tarif_max' => $request->tarif_max,
                    'biographie' => $request->biographie,
                    'document_justificatif' => $documentPath,
                    'photo' => $photoPath,
                    'disponibilite' => true,
                    'statut' => 'en_attente',
                    'vues' => 0,
                ]);
            }

            return $utilisateur;
        });

        // Notifie les administrateurs (hors transaction, pour ne pas bloquer si l'email échoue)
        if ($utilisateur->role === 'talent') {
            $this->notifierAdminsNouveauTalent($utilisateur);
        }

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

        // Bloque la connexion d'un talent non encore validé
        if ($utilisateur->isTalent()) {
            $profil = $utilisateur->profilTalent;

            if (!$profil || $profil->statut !== 'valide') {
                $message = match ($profil?->statut) {
                    'rejete' => 'Votre profil a été refusé. Motif : ' . ($profil->motif_rejet ?? 'non précisé'),
                    'desactive' => 'Votre compte a été désactivé par un administrateur. Contactez le support pour plus d\'informations.',
                    default => 'Votre compte est en attente de validation par un administrateur.',
                };

                return response()->json(['message' => $message], 403);
            }
        }

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