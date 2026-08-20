<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Abonnement extends Model
{
    protected $fillable = [
        'utilisateur_id', 'statut', 'date_debut', 'date_fin',
        'montant', 'fedapay_transaction_id', 'fedapay_statut',
    ];

    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin'   => 'datetime',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function estExpire(): bool
    {
        return Carbon::now()->greaterThan($this->date_fin);
    }
}