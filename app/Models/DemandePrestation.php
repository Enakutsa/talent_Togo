<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandePrestation extends Model
{
    protected $table = 'demandes_prestation';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
        'statut',
        'message_initial',
        'date_souhaitee',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'date_souhaitee' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    /**
     * Relation : une demande appartient à un client.
     */
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * Relation : une demande concerne un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }

    /**
     * Relation : une demande génère plusieurs messages (fil de discussion).
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'demande_prestation_id');
    }

    /**
     * Relation : une demande peut être liée à un avis.
     */
    public function avis()
    {
        return $this->hasOne(Avis::class, 'demande_prestation_id');
    }
}