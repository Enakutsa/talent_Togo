<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signalement extends Model
{
    protected $table = 'signalements';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
        'motif',
        'description',
        'statut',
    ];

    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }
}