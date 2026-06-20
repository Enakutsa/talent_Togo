<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    protected $table = 'avis';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
        'demande_prestation_id',
        'note',
        'commentaire',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'note' => 'integer',
        ];
    }

    /**
     * Relation : un avis est laissé par un client.
     */
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * Relation : un avis concerne un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }

    /**
     * Relation : un avis peut être rattaché à une demande de prestation.
     */
    public function demandePrestation()
    {
        return $this->belongsTo(DemandePrestation::class, 'demande_prestation_id');
    }

    public function estVisible(): bool
    {
        return $this->statut === 'visible';
    }
}