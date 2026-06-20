<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'demande_prestation_id',
        'expediteur_id',
        'contenu',
        'lu',
    ];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
        ];
    }

    /**
     * Relation : un message appartient à une demande de prestation (fil de discussion).
     */
    public function demandePrestation()
    {
        return $this->belongsTo(DemandePrestation::class, 'demande_prestation_id');
    }

    /**
     * Relation : un message a été envoyé par un utilisateur.
     */
    public function expediteur()
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur_id');
    }
}