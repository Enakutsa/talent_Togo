<?php

namespace App\Http\Controllers;

class CloudinarySignatureController extends Controller
{
    /**
     * ✅ Génère une signature d'upload Cloudinary, pour permettre au
     * navigateur d'uploader un fichier DIRECTEMENT vers Cloudinary, sans
     * passer par notre serveur Laravel comme intermédiaire.
     *
     * Avant : navigateur → Laravel (upload) → Cloudinary (upload) = le
     * fichier fait DEUX fois le trajet réseau, ce qui double la latence
     * ressentie (mesurée à ~3.45s pour un simple PDF de 121 Ko).
     *
     * Après : navigateur → Cloudinary directement = un seul trajet.
     *
     * ⚠️ Cette route est PUBLIQUE (appelée avant que le talent ait un
     * compte, pendant l'inscription) — on ne peut donc PAS se contenter
     * de vérifier qu'un utilisateur est connecté. On limite les dégâts
     * possibles par :
     * - Un dossier Cloudinary FIXE (pas choisi par le client), pour
     *   qu'un abus reste cantonné à un seul dossier repérable.
     * - Un throttle sur la route (voir routes/api.php) pour empêcher
     *   quelqu'un de spammer cet endpoint pour épuiser notre quota
     *   Cloudinary.
     * - Une signature valable seulement quelques minutes (le timestamp
     *   est vérifié côté Cloudinary, pas juste côté client).
     */
    public function sign()
    {
        $cloudUrl = config('cloudinary.cloud_url');

        // cloudinary://<api_key>:<api_secret>@<cloud_name>
        $parsed = parse_url($cloudUrl);
        $apiKey    = $parsed['user'] ?? null;
        $apiSecret = $parsed['pass'] ?? null;
        $cloudName = $parsed['host'] ?? null;

        if (!$apiKey || !$apiSecret || !$cloudName) {
            return response()->json([
                'message' => 'Configuration Cloudinary invalide côté serveur.',
            ], 500);
        }

        $timestamp = time();
        $folder    = 'talenttogo/documents_justificatifs';

        // ── Paramètres à signer, triés alphabétiquement (obligatoire
        // pour que la signature soit valide côté Cloudinary) ──
        $paramsToSign = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
        ];
        ksort($paramsToSign);

        $paramString = urldecode(http_build_query($paramsToSign));
        $signature   = sha1($paramString . $apiSecret);

        return response()->json([
            'success' => true,
            'data'    => [
                'signature'  => $signature,
                'timestamp'  => $timestamp,
                'api_key'    => $apiKey,
                'cloud_name' => $cloudName,
                'folder'     => $folder,
            ],
        ]);
    }
}