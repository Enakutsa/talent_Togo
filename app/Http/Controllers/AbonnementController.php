<?php

namespace App\Http\Controllers;

use App\Services\FedaPayService;
use App\Models\Abonnement;
use Illuminate\Http\Request;

class AbonnementController extends Controller
{
    protected FedaPayService $fedaPay;

    public function __construct(FedaPayService $fedaPay)
    {
        $this->fedaPay = $fedaPay;
    }

    // Abonnement ANNUEL — 12 000 XOF pour 1 an.
    const MONTANT_ABONNEMENT = 12000; // XOF

    public function initierPaiement(Request $request)
    {
        $utilisateur = $request->user();

        $transaction = $this->fedaPay->creerTransaction(
            self::MONTANT_ABONNEMENT,
            'Abonnement annuel TalentTogo - ' . $utilisateur->prenom . ' ' . $utilisateur->nom,
            [
                'firstname'    => $utilisateur->prenom,
                'lastname'     => $utilisateur->nom,
                'email'        => $utilisateur->email,
                // ⚠️ TEMPORAIRE POUR TESTS/DÉMO SANDBOX : les numéros de
                // test FedaPay (64000001 / 66000001) sont au format
                // béninois. REMETTRE 'TG' avant le passage en production
                // (voir checklist mode Live donnée précédemment).
                'phone_number' => ['number' => $utilisateur->telephone, 'country' => 'BJ'],
            ],
            config('app.frontend_url') . '/abonnement/callback'
        );

        Abonnement::create([
            'utilisateur_id'         => $utilisateur->id,
            'statut'                 => 'expire',
            'date_debut'             => now(),
            'date_fin'               => now(),
            'montant'                => self::MONTANT_ABONNEMENT,
            'fedapay_transaction_id' => $transaction->id,
            'fedapay_statut'         => 'pending',
        ]);

        $token = $transaction->generateToken();

        return response()->json([
            'payment_url' => $token->url,
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();

        if (($payload['name'] ?? null) === 'transaction.approved') {
            $transactionId = $payload['entity']['id'];

            $abonnement = Abonnement::where('fedapay_transaction_id', $transactionId)->first();

            if ($abonnement) {
                $dateFin = now()->addYear();

                $abonnement->update([
                    'statut'         => 'actif',
                    'date_fin'       => $dateFin,
                    'fedapay_statut' => 'approved',
                ]);

                $abonnement->utilisateur->update(['abonnement_expire_le' => $dateFin]);
            }
        }

        return response()->json(['received' => true]);
    }
}