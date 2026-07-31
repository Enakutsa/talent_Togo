<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleAuthController;

Route::get('/check-tables', function () {
    $tables = \Illuminate\Support\Facades\DB::select("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    return response()->json($tables);
});

// --------------------------------------------------------------------------
// AUTH GOOGLE (OAuth2) — dans web.php (pas api.php) car ces routes ont
// besoin des sessions Laravel pour mémoriser le rôle choisi (client/talent)
// entre la redirection vers Google et le retour via callback().
// --------------------------------------------------------------------------
Route::get('/auth/google/redirect/{role?}', [GoogleAuthController::class, 'redirect'])
    ->name('google.redirect');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
    ->name('google.callback');

// ⚠️ Route catch-all : DOIT rester en dernier. Toute route ajoutée après
// celle-ci ne sera jamais atteinte, car "/{any}" avec ->where('any', '.*')
// intercepte absolument toutes les URLs restantes (nécessaire pour que
// React Router gère le routing côté client sur un refresh de page).
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');