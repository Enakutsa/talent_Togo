<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilTalent extends Model
{
    protected $table = 'profils_talents';

    protected $fillable = [
        'utilisateur_id',
        'tarif_min',
        'tarif_max',
        'biographie',
        'photo',
        'photo_public_id',
        'disponibilite',
        'vues',
    ];

    protected function casts(): array
    {
        return [
            'disponibilite' => 'boolean',
            'tarif_min'     => 'decimal:2',
            'tarif_max'     => 'decimal:2',
        ];
    }

    // ===== RELATIONS =====

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function portfolios()
    {
        return $this->hasMany(Portfolio::class, 'profil_talent_id');
    }

    public function demandesPrestation()
    {
        return $this->hasMany(DemandePrestation::class, 'profil_talent_id');
    }

    public function avis()
    {
        return $this->hasMany(Avis::class, 'profil_talent_id');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class, 'profil_talent_id');
    }

    // ===== HELPERS =====

    // ⚠️ categorie_id et ville vivent maintenant sur Utilisateur.
    public function estComplet(): bool
    {
        return !is_null($this->utilisateur?->ville)
            && !is_null($this->utilisateur?->categorie_id)
            && !is_null($this->photo);
    }
}