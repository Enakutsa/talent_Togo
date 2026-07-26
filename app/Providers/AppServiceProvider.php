<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
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
            \URL::forceScheme('https');
        }

        Mail::extend('brevo+api', function (array $config = []) {
            return (new BrevoTransportFactory())->create(
                new Dsn('brevo+api', 'default', $config['key'] ?? null)
            );
        });
    }
}