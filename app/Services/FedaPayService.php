<?php

namespace App\Services;

use FedaPay\FedaPay;
use FedaPay\Transaction;

class FedaPayService
{
    public function __construct()
    {
        FedaPay::setApiKey(config('services.fedapay.secret_key'));
        FedaPay::setEnvironment(config('services.fedapay.env'));
    }

    public function creerTransaction(int $montant, string $description, array $customer, string $callbackUrl): Transaction
    {
        return Transaction::create([
            'description'  => $description,
            'amount'       => $montant,
            'currency'     => ['iso' => 'XOF'],
            'callback_url' => $callbackUrl,
            'customer'     => $customer,
        ]);
    }
}