<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

Route::get('/check-tables', function () {
    $tables = \Illuminate\Support\Facades\DB::select("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    return response()->json($tables);
});