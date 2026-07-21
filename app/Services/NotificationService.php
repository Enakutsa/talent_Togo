<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Utilisateur;

class NotificationService
{
    public static function creer(Utilisateur $utilisateur, string $type, string $contenu, array $data = []): Notification
    {
        return Notification::create([
            'utilisateur_id' => $utilisateur->id,
            'type' => $type,
            'contenu' => $contenu,
            'data' => $data,
            'lu' => false,
        ]);
    }
}