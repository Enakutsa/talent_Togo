<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ProfilTalentController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TalentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\DemandePrestationController;
use App\Http\Controllers\AvisController;
use App\Http\Controllers\SignalementController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;


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

        // ── Page "Paramètres" (espace client) ──────────────────────────
        // ⚠️ Le changement de mot de passe passe par PUT /user (voir
        // AuthController::update) avec mot_de_passe_actuel +
        // nouveau_mot_de_passe + nouveau_mot_de_passe_confirmation.
        // Pas de route séparée pour éviter de dupliquer cette logique.

        // Préférences de notification (emails "demandes"/"messages",
        // notifications in-app). GET renvoie les valeurs actuelles
        // (avec des valeurs par défaut si l'utilisateur n'en a pas encore).
        Route::get('/notifications', [AuthController::class, 'getNotificationPrefs']);
        Route::put('/notifications', [AuthController::class, 'updateNotificationPrefs']);

        // Révoque tous les tokens Sanctum de l'utilisateur SAUF celui
        // utilisé pour cette requête -> déconnecte les autres appareils
        // sans déconnecter la session en cours.
        Route::post('/logout-all', [AuthController::class, 'logoutAllDevices']);
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

// ✅ 3 clients mis en avant — utilisé par la home (section "Témoignages").
// Pas d'authentification requise. Renvoie uniquement nom/ville/avatar.
Route::get('/clients/featured', [ClientController::class, 'featured']);

// ✅ Meilleurs avis publics tous talents confondus — utilisé par la home
// (section "Témoignages"). Pas d'authentification requise. Placée avant le
// groupe /client/avis pour rester bien groupée avec le reste du contenu
// public de la page d'accueil.
Route::get('/avis', [AvisController::class, 'indexPublic']);


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

// --------------------------------------------------------------------------
// AVIS (CRUD) — Réservé au rôle "client" (vérifié dans le contrôleur)
// --------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/client/avis', [AvisController::class, 'store']);
    Route::get('/client/avis', [AvisController::class, 'indexClient']);
    Route::get('/talent/avis', [AvisController::class, 'indexTalent']);
});


// --------------------------------------------------------------------------
// SIGNALEMENTS (CRUD) — Réservé au rôle "client" (v
//érifié dans le contrôleur)
// --------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/client/signalements', [SignalementController::class, 'store']);
});

//--------------------------------------------------------------------------
// MESSAGERIE — conversations rattachées à une demande de prestation
// (voir MessageController pour le détail du fonctionnement).
//--------------------------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/client/conversations', [MessageController::class, 'indexClient']);
    Route::post('/client/conversations/start', [MessageController::class, 'start']);
    Route::get('/talent/conversations', [MessageController::class, 'indexTalent']);
 
    // Communes aux deux rôles — le contrôleur vérifie que l'utilisateur
    // connecté fait bien partie de la conversation.
    Route::get('/conversations/{demande}/messages', [MessageController::class, 'show']);
    Route::post('/conversations/{demande}/messages', [MessageController::class, 'store']);

    // Modification / suppression d'un message individuel — le contrôleur
    // vérifie l'appartenance à la conversation et les droits (auteur
    // uniquement pour modifier ou supprimer "pour tous").
    Route::patch('/messages/{id}', [MessageController::class, 'update']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
});

// --------------------------------------------------------------------------
// NOTIFICATIONS (CRUD) — Réservé à tous les rôles (vérifié dans le contrôleur)
// --------------------------------------------------------------------------

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/lu', [NotificationController::class, 'marquerLue']);
    Route::patch('/notifications/tout-lire', [NotificationController::class, 'toutMarquerLu']);
});