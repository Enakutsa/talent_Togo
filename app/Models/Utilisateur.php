<?php

namespace App\Models;

use Database\Factories\UtilisateurFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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