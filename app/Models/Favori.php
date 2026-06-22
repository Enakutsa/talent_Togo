<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $client_id
 * @property int $profil_talent_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Utilisateur $client
 * @property-read \App\Models\ProfilTalent $profilTalent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori whereProfilTalentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Favori whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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