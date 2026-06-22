<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $demande_prestation_id
 * @property int $expediteur_id
 * @property string $contenu
 * @property bool $lu
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\DemandePrestation $demandePrestation
 * @property-read \App\Models\Utilisateur $expediteur
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereContenu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereDemandePrestationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereExpediteurId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereLu($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'demande_prestation_id',
        'expediteur_id',
        'contenu',
        'lu',
    ];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
        ];
    }

    /**
     * Relation : un message appartient à une demande de prestation (fil de discussion).
     */
    public function demandePrestation()
    {
        return $this->belongsTo(DemandePrestation::class, 'demande_prestation_id');
    }

    /**
     * Relation : un message a été envoyé par un utilisateur.
     */
    public function expediteur()
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur_id');
    }
}