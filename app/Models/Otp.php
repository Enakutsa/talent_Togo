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
        'tentatives',
        'bloque_jusqua',
    ];

    protected function casts(): array
    {
        return [
            'expire_a'      => 'datetime',
            'utilise'       => 'boolean',
            'tentatives'    => 'integer',
            'bloque_jusqua' => 'datetime',
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

    public function estBloque(): bool
    {
        return $this->bloque_jusqua && now()->lessThan($this->bloque_jusqua);
    }

    public function secondesRestantes(): int
    {
        if (!$this->estBloque()) return 0;
        return (int) now()->diffInSeconds($this->bloque_jusqua);
    }
}