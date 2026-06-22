<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $utilisateur_id
 * @property string $code
 * @property string $type
 * @property \Illuminate\Support\Carbon $expire_a
 * @property bool $utilise
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Utilisateur $utilisateur
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereExpireA($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereUtilisateurId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Otp whereUtilise($value)
 * @mixin \Eloquent
 */
class Otp extends Model
{
    protected $table = 'otps';

    protected $fillable = [
        'utilisateur_id',
        'code',
        'type',
        'expire_a',
        'utilise',
    ];

    protected function casts(): array
    {
        return [
            'expire_a' => 'datetime',
            'utilise' => 'boolean',
        ];
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function estExpire(): bool
    {
        return now()->greaterThan($this->expire_a);
    }
}