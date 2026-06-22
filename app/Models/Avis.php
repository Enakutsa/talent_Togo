<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $client_id
 * @property int $profil_talent_id
 * @property int|null $demande_prestation_id
 * @property int $note
 * @property string|null $commentaire
 * @property string $statut
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Utilisateur $client
 * @property-read \App\Models\DemandePrestation|null $demandePrestation
 * @property-read \App\Models\ProfilTalent $profilTalent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereCommentaire($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereDemandePrestationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereProfilTalentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Avis whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Avis extends Model
{
    protected $table = 'avis';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
        'demande_prestation_id',
        'note',
        'commentaire',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'note' => 'integer',
        ];
    }

    /**
     * Relation : un avis est laissé par un client.
     */
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * Relation : un avis concerne un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }

    /**
     * Relation : un avis peut être rattaché à une demande de prestation.
     */
    public function demandePrestation()
    {
        return $this->belongsTo(DemandePrestation::class, 'demande_prestation_id');
    }

    public function estVisible(): bool
    {
        return $this->statut === 'visible';
    }
}