<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favori extends Model
{
    protected $table = 'favoris';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
    ];

    /**
     * Relation : un favori appartient à un client.
     */
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * Relation : un favori concerne un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }
}