<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $profil_talent_id
 * @property string $type
 * @property string $media_url
 * @property string $public_id
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\ProfilTalent $profilTalent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereMediaUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereProfilTalentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio wherePublicId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Portfolio whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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