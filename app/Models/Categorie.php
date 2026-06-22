<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $nom
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProfilTalent> $profilsTalent
 * @property-read int|null $profils_talent_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie whereNom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Categorie whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Categorie extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'nom',
        'description',
    ];

    /**
     * Relation : une catégorie regroupe plusieurs profils talent.
     */
    public function profilsTalent()
    {
        return $this->hasMany(ProfilTalent::class, 'categorie_id');
    }
}