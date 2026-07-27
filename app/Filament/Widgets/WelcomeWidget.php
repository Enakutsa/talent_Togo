<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;

class WelcomeWidget extends Widget
{
    protected string $view = 'filament.widgets.welcome-widget';

    protected int|string|array $columnSpan = 'full';

    public function getGreeting(): string
    {
        $hour = now()->hour;

        return match (true) {
            $hour < 12 => 'Bonjour',
            $hour < 18 => 'Bon après-midi',
            default => 'Bonsoir',
        };
    }

    public function getAdminName(): string
    {
        $user = Auth::user();

        return trim(($user->prenom ?? '') . ' ' . ($user->nom ?? '')) ?: 'Admin';
    }

    /**
     * ✅ Déconnexion via Livewire — fonctionne correctement avec le mode
     * SPA de Filament, contrairement à un formulaire caché soumis en JS
     * classique qui pouvait être intercepté/ignoré par la navigation SPA.
     */
    public function logout()
    {
        Auth::guard('web')->logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/admin/login');
    }
}