<?php

namespace App\Models;

use Database\Factories\UtilisateurFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $nom
 * @property string $prenom
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $mot_de_passe
 * @property string $role
 * @property bool $is_verified
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Avis> $avisDonnes
 * @property-read int|null $avis_donnes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\DemandePrestation> $demandesPrestation
 * @property-read int|null $demandes_prestation_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Favori> $favoris
 * @property-read int|null $favoris_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Notification> $notificationsInternes
 * @property-read int|null $notifications_internes_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Otp> $otps
 * @property-read int|null $otps_count
 * @property-read \App\Models\ProfilTalent|null $profilTalent
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereIsVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereMotDePasse($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereNom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur wherePrenom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Utilisateur whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Utilisateur extends Authenticatable
{
    /** @use HasFactory<UtilisateurFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'utilisateurs';

    /**
     * Les attributs assignables en masse.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'mot_de_passe',
        'role',
        'is_verified',
    ];

    /**
     * Les attributs cachés lors de la sérialisation.
     *
     * @var list<string>
     */
    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    /**
     * Les attributs à transformer (cast).
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mot_de_passe' => 'hashed',
            'is_verified' => 'boolean',
        ];
    }

    /**
     * Indique à Laravel quelle colonne utiliser comme mot de passe
     * pour l'authentification (Sanctum, Auth::attempt, Hash::check...).
     */
    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    /**
     * Relation : un utilisateur (talent) possède un profil talent.
     */
    public function profilTalent()
    {
        return $this->hasOne(ProfilTalent::class, 'utilisateur_id');
    }

    /**
     * Relation : un utilisateur (client) peut envoyer plusieurs demandes de prestation.
     */
    public function demandesPrestation()
    {
        return $this->hasMany(DemandePrestation::class, 'client_id');
    }

    /**
     * Relation : un utilisateur peut recevoir plusieurs notifications.
     */
    public function notificationsInternes()
    {
        return $this->hasMany(Notification::class, 'utilisateur_id');
    }

    /**
     * Relation : un utilisateur (client) peut avoir plusieurs favoris.
     */
    public function favoris()
    {
        return $this->hasMany(Favori::class, 'client_id');
    }

    /**
     * Relation : un utilisateur (client) peut laisser plusieurs avis.
     */
    public function avisDonnes()
    {
        return $this->hasMany(Avis::class, 'client_id');
    }

    /**
     * Relation : codes OTP liés à cet utilisateur.
     */
    public function otps()
    {
        return $this->hasMany(Otp::class, 'utilisateur_id');
    }

    public function isTalent(): bool
    {
        return $this->role === 'talent';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}