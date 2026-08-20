<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CheckAbonnementActif
{
    public function handle(Request $request, Closure $next)
    {
        $utilisateur = $request->user();

        if (!$utilisateur || $utilisateur->role !== 'talent') {
            return $next($request);
        }

        // ✅ null (plan payant jamais payé) OU date dépassée = bloqué.
        // Avant, "null && ..." court-circuitait à false et laissait
        // passer un talent qui n'avait jamais payé — bug corrigé ici.
        $expire = is_null($utilisateur->abonnement_expire_le)
            || Carbon::now()->greaterThan($utilisateur->abonnement_expire_le);

        if ($expire) {
            return response()->json([
                'message' => 'Votre abonnement a expiré. Veuillez le renouveler pour continuer à recevoir des demandes.',
                'abonnement_expire' => true,
            ], 403);
        }

        return $next($request);
    }
}