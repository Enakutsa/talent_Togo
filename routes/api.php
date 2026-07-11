<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ProfilTalentController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TalentController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\DemandePrestationController;

/*
|--------------------------------------------------------------------------
| AUTH PUBLIC
|--------------------------------------------------------------------------
| Accessible sans être connecté : inscription, connexion (email -> OTP),
| vérification du code, renvoi de code.
*/
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // 🔥 anti brute force

    Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp'])
        ->middleware('throttle:5,1');

    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});


/*
|--------------------------------------------------------------------------
| AUTH PROTECTED
|--------------------------------------------------------------------------
| Nécessite un token Sanctum valide (utilisateur connecté, tous rôles
| confondus sauf mention contraire dans le contrôleur).
*/
Route::middleware('auth:sanctum')->group(function () {

    // Compte de l'utilisateur connecté (infos de base : nom, prénom,
    // téléphone, mot de passe). Ne gère PAS le profil talent.
    Route::prefix('user')->group(function () {
        Route::get('/', [AuthController::class, 'me']);
        Route::put('/', [AuthController::class, 'update']);
        Route::delete('/', [AuthController::class, 'destroy']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Profil Talent (auto-service) : le talent connecté consulte et
    // complète SON PROPRE profil (tarifs, bio, photo, disponibilité).
    // Réservé au rôle "talent" — vérifié dans le contrôleur (assertTalent).
    // En POST (pas PUT) car upload de photo en multipart/form-data.
    Route::prefix('talent')->group(function () {
        Route::get('/profil', [ProfilTalentController::class, 'show']);
        Route::post('/profil', [ProfilTalentController::class, 'update']);
    });
});


/*
|--------------------------------------------------------------------------
| PUBLIC (lecture seule, pas d'authentification requise)
|--------------------------------------------------------------------------
| Catégories, statistiques globales, listing/détail des talents validés.
*/
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/stats', [StatsController::class, 'index']);
Route::get('/talents', [TalentController::class, 'index']);
Route::get('/talents/{talent}', [TalentController::class, 'show']);


//--------------------------------------------------------------------------
// PORTFOLIO (CRUD) — Réservé au rôle "talent" (vérifié dans le contrôleur)
//--------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/talent/portfolio', [PortfolioController::class, 'index']);
    Route::post('/talent/portfolio', [PortfolioController::class, 'store']);
    Route::delete('/talent/portfolio/{id}', [PortfolioController::class, 'destroy']);
});


//--------------------------------------------------------------------------
// FAVORIS (CRUD) — Réservé au rôle "client" (vérifié dans le contrôleur)
//--------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/client/favoris', [FavoriController::class, 'index']);
    Route::post('/client/favoris/{talentId}', [FavoriController::class, 'toggle']);
});

//--------------------------------------------------------------------------
// DEMANDES DE PRESTATION (CRUD) — Réservé aux rôles "client" et "talent" (vérifié dans le contrôleur)
//--------------------------------------------------------------------------

Route::middleware('auth:sanctum')->group(function () {
    // ... autres routes ...
    Route::get('/client/demandes', [DemandePrestationController::class, 'indexClient']);
    Route::post('/client/demandes', [DemandePrestationController::class, 'store']);
    Route::delete('/client/demandes/{id}', [DemandePrestationController::class, 'annuler']); // ← ajoute cette ligne

    Route::get('/talent/demandes', [DemandePrestationController::class, 'indexTalent']);
    Route::patch('/talent/demandes/{id}', [DemandePrestationController::class, 'repondre']);
});


