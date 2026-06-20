<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilTalent extends Model
{
    protected $table = 'profils_talent';

    protected $fillable = [
        'utilisateur_id',
        'categorie_id',
        'ville',
        'tarif_min',
        'tarif_max',
        'biographie',
        'disponibilite',
        'statut',
        'vues',
    ];

    protected function casts(): array
    {
        return [
            'disponibilite' => 'boolean',
            'tarif_min' => 'decimal:2',
            'tarif_max' => 'decimal:2',
        ];
    }

    /**
     * Relation : un profil talent appartient à un utilisateur.
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    /**
     * Relation : un profil talent appartient à une catégorie.
     */
    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    /**
     * Relation : un profil talent possède plusieurs éléments de portfolio.
     */
    public function portfolios()
    {
        return $this->hasMany(Portfolio::class, 'profil_talent_id');
    }

    /**
     * Relation : un profil talent reçoit plusieurs demandes de prestation.
     */
    public function demandesPrestation()
    {
        return $this->hasMany(DemandePrestation::class, 'profil_talent_id');
    }

    /**
     * Relation : un profil talent reçoit plusieurs avis.
     */
    public function avis()
    {
        return $this->hasMany(Avis::class, 'profil_talent_id');
    }

    /**
     * Relation : un profil talent peut être mis en favori par plusieurs clients.
     */
    public function favoris()
    {
        return $this->hasMany(Favori::class, 'profil_talent_id');
    }

    public function estValide(): bool
    {
        return $this->statut === 'valide';
    }
}