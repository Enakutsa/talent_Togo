<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $utilisateur_id
 * @property int $categorie_id
 * @property string $ville
 * @property numeric|null $tarif_min
 * @property numeric|null $tarif_max
 * @property string|null $biographie
 * @property bool $disponibilite
 * @property string $statut
 * @property int $vues
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $motif_rejet
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Avis> $avis
 * @property-read int|null $avis_count
 * @property-read \App\Models\Categorie $categorie
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DemandePrestation> $demandesPrestation
 * @property-read int|null $demandes_prestation_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Favori> $favoris
 * @property-read int|null $favoris_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Portfolio> $portfolios
 * @property-read int|null $portfolios_count
 * @property-read \App\Models\Utilisateur $utilisateur
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereBiographie($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereCategorieId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereDisponibilite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereMotifRejet($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereTarifMax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereTarifMin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereUtilisateurId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereVille($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProfilTalent whereVues($value)
 * @mixin \Eloquent
 */
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