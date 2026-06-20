<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    protected $table = 'portfolios';

    protected $fillable = [
        'profil_talent_id',
        'type',
        'media_url',
        'public_id',
        'description',
    ];

    /**
     * Relation : un élément de portfolio appartient à un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }
}