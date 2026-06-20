<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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