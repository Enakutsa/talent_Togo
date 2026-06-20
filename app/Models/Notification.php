<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'utilisateur_id',
        'type',
        'contenu',
        'data',
        'lu',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'lu' => 'boolean',
        ];
    }

    /**
     * Relation : une notification appartient à un utilisateur.
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}