<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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