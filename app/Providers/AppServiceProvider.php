<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // ✅ Force Laravel à toujours utiliser APP_URL (avec le bon port)
        // pour générer ses liens/assets, au lieu de se baser sur les
        // en-têtes de la requête HTTP reçue via Nginx/PHP-FPM — ceux-ci
        // perdaient le port (:8000) en cours de route, cassant les CSS/JS
        // de Filament.
        if (config('app.url')) {
            URL::forceRootUrl(config('app.url'));
        }

        Mail::extend('brevo+api', function (array $config = []) {
            return (new BrevoTransportFactory())->create(
                new Dsn('brevo+api', 'default', $config['key'] ?? null)
            );
        });
    }
}