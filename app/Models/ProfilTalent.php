<?php

namespace App\Models;
use App\Models\Categorie;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $utilisateur_id
 * @property int|null $categorie_id
 * @property string|null $categorie
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
 * @property-read \App\Models\Categorie $categorieRelation
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
    protected $table = 'profils_talents'; // ✅ CORRIGÉ : avec le S

    protected $fillable = [
        'utilisateur_id',
        'categorie_id',
        'categorie', // ✅ champ texte temporaire (Module 3 pas encore fait)
        'ville',
        'tarif_min',
        'tarif_max',
        'biographie',
        'document_justificatif',
        'disponibilite',
        'statut',
        'motif_rejet',
        'vues'
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
     * Relation : un profil talent appartient à une catégorie (table categories).
     * Reste utilisable plus tard pour le Module 3, actuellement souvent null.
     */
    public function categorieRelation()
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

    

public function categorie()
{
    return $this->belongsTo(Categorie::class, 'categorie_id');
}
}


