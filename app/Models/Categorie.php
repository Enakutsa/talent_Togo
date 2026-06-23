<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model; // ✅ CORRECT

class Categorie extends Model
{
    protected $table = 'categories';

    protected $fillable = [
        'nom',
        'description',
    ];

    public function profils()
    {
        return $this->hasMany(ProfilTalent::class, 'categorie_id');
    }
}
