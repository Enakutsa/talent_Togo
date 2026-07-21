<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Utilisateur;

class NotificationService
{
    /**
     * Valeurs par défaut si l'utilisateur n'a jamais défini ses
     * préférences — mêmes valeurs que AuthController::getNotificationPrefs.
     */
    private const DEFAULTS = [
        'notifications_in_app' => true,
        'email_demandes'       => true,
        'email_messages'       => true,
    ];

    /**
     * Fait correspondre un type de notification à la préférence qui le
     * contrôle. Un type absent de cette liste (ex: signalement traité par
     * un admin) n'a pas de sous-préférence dédiée -> toujours autorisé tant
     * que le toggle maître 'notifications_in_app' est activé.
     */
    private const TYPE_VERS_PREFERENCE = [
        'nouvelle_demande' => 'email_demandes',
        'demande_acceptee' => 'email_demandes',
        'demande_refusee'  => 'email_demandes',
        'nouvel_avis'      => 'email_demandes',
        'nouveau_message'  => 'email_messages',
    ];

    /**
     * Crée une notification pour l'utilisateur, SAUF s'il a désactivé les
     * notifications (toggle maître) ou la catégorie concernée par ce type.
     * Renvoie null si la notification a été bloquée par les préférences,
     * pour rester facile à distinguer d'une vraie erreur si besoin plus tard.
     */
    public static function creer(Utilisateur $utilisateur, string $type, string $contenu, array $data = []): ?Notification
    {
        if (!self::estAutorisee($utilisateur, $type)) {
            return null;
        }

        return Notification::create([
            'utilisateur_id' => $utilisateur->id,
            'type' => $type,
            'contenu' => $contenu,
            'data' => $data,
            'lu' => false,
        ]);
    }

    private static function estAutorisee(Utilisateur $utilisateur, string $type): bool
    {
        $prefs = $utilisateur->preferences_notifications
            ? array_merge(self::DEFAULTS, $utilisateur->preferences_notifications)
            : self::DEFAULTS;

        // Toggle maître désactivé -> aucune notification, peu importe le type.
        if (!$prefs['notifications_in_app']) {
            return false;
        }

        $sousPreference = self::TYPE_VERS_PREFERENCE[$type] ?? null;

        // Type sans sous-préférence dédiée -> autorisé (le maître suffit).
        if ($sousPreference === null) {
            return true;
        }

        return (bool) ($prefs[$sousPreference] ?? true);
    }
}