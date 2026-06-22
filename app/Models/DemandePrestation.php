<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $client_id
 * @property int $profil_talent_id
 * @property string $statut
 * @property string $message_initial
 * @property \Illuminate\Support\Carbon|null $date_souhaitee
 * @property numeric|null $budget
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Avis|null $avis
 * @property-read \App\Models\Utilisateur $client
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $messages
 * @property-read int|null $messages_count
 * @property-read \App\Models\ProfilTalent $profilTalent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereBudget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereDateSouhaitee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereMessageInitial($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereProfilTalentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereStatut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|DemandePrestation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class DemandePrestation extends Model
{
    protected $table = 'demandes_prestation';

    protected $fillable = [
        'client_id',
        'profil_talent_id',
        'statut',
        'message_initial',
        'date_souhaitee',
        'budget',
    ];

    protected function casts(): array
    {
        return [
            'date_souhaitee' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    /**
     * Relation : une demande appartient à un client.
     */
    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'client_id');
    }

    /**
     * Relation : une demande concerne un profil talent.
     */
    public function profilTalent()
    {
        return $this->belongsTo(ProfilTalent::class, 'profil_talent_id');
    }

    /**
     * Relation : une demande génère plusieurs messages (fil de discussion).
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'demande_prestation_id');
    }

    /**
     * Relation : une demande peut être liée à un avis.
     */
    public function avis()
    {
        return $this->hasOne(Avis::class, 'demande_prestation_id');
    }
}