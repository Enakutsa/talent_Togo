<?php

namespace App\Models;

use Database\Factories\UtilisateurFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasName;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable implements FilamentUser, HasName
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'mot_de_passe',
        'role',
        'is_verified',
        'document_justificatif',
        'statut',
        'motif_rejet',
        'ville',
        'categorie_id',
        'photo',
        'preferences_notifications',
        // ✅ Nécessaire pour que register() et le webhook FedaPay
        // puissent faire ->update(['abonnement_expire_le' => ...])
        // sans être bloqués par la protection mass-assignment.
        'abonnement_expire_le',
        // ✅ Sans ce champ dans $fillable, Utilisateur::create() ignorait
        // silencieusement la valeur envoyée par register() — la colonne
        // retombait toujours sur son défaut 'gratuit' peu importe le
        // choix réel du talent à l'inscription.
        'plan_choisi',
    ];

    protected $hidden = [
        'mot_de_passe',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'mot_de_passe'      => 'hashed',
            'is_verified'       => 'boolean',
            'preferences_notifications' => 'array',
            // ✅ Sans ce cast, abonnement_expire_le reste une string
            // brute côté PHP : ->isFuture() (utilisé dans
            // TalentController@show) planterait, et le JSON envoyé au
            // frontend ne serait pas dans un format fiable pour
            // `new Date(user.abonnement_expire_le)` côté React.
            'abonnement_expire_le' => 'datetime',
        ];
    }

    public function getAuthPassword()
    {
        return $this->mot_de_passe;
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin';
    }

    public function getFilamentName(): string
    {
        return trim($this->prenom . ' ' . $this->nom);
    }

    // ===== RELATIONS =====

    public function profilTalent()
    {
        return $this->hasOne(ProfilTalent::class, 'utilisateur_id');
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    public function demandesPrestation()
    {
        return $this->hasMany(DemandePrestation::class, 'client_id');
    }

    public function notificationsInternes()
    {
        return $this->hasMany(Notification::class, 'utilisateur_id');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class, 'client_id');
    }

    public function avisDonnes()
    {
        return $this->hasMany(Avis::class, 'client_id');
    }

    public function otps()
    {
        return $this->hasMany(Otp::class, 'utilisateur_id');
    }

    public function signalements()
    {
        return $this->hasMany(Signalement::class, 'client_id');
    }

    // ✅ Historique des abonnements de ce talent (essai gratuit +
    // paiements successifs). Utile pour l'admin (Filament) ou pour
    // afficher l'historique côté talent plus tard.
    public function abonnements()
    {
        return $this->hasMany(Abonnement::class, 'utilisateur_id');
    }

    // ===== HELPERS =====

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

    public function estValide(): bool
    {
        return $this->statut === 'valide';
    }

    public function estEnAttente(): bool
    {
        return $this->statut === 'en_attente';
    }

    public function estDesactive(): bool
    {
        return $this->statut === 'desactive';
    }
}