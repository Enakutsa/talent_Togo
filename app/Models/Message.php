<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'demande_prestation_id',
        'expediteur_id',
        'contenu',
        'lu',
        'modifie',
        'supprime_pour_tous',
        'supprime_expediteur',
        'supprime_destinataire',
    ];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
            'modifie' => 'boolean',
            'supprime_pour_tous' => 'boolean',
            'supprime_expediteur' => 'boolean',
            'supprime_destinataire' => 'boolean',
        ];
    }

    public function demandePrestation()
    {
        return $this->belongsTo(DemandePrestation::class, 'demande_prestation_id');
    }

    public function expediteur()
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur_id');
    }

    /**
     * Vérifie si ce message doit être masqué pour un utilisateur donné.
     */
    public function estMasquePour(int $utilisateurId): bool
    {
        if ($this->supprime_pour_tous) {
            return false; // reste visible mais avec contenu remplacé (géré côté format())
        }

        if ($this->expediteur_id === $utilisateurId) {
            return $this->supprime_expediteur;
        }

        return $this->supprime_destinataire;
    }
}