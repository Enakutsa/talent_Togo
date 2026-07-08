<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfilTalentController extends Controller
{
    /**
     * Vérifie que l'utilisateur connecté est bien un talent, sinon 403.
     */
    private function assertTalent(Request $request): void
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');
    }

    /**
     * Récupère le profil du talent connecté (créé vide à l'inscription,
     * donc il existe toujours — mais on gère le cas au cas où).
     * GET /api/talent/profil
     */
    public function show(Request $request)
    {
        $this->assertTalent($request);

        $utilisateur = $request->user();
        $profil = $utilisateur->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $profil->load('utilisateur.categorie');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $profil->id,
                'tarif_min' => $profil->tarif_min,
                'tarif_max' => $profil->tarif_max,
                'biographie' => $profil->biographie,
                'disponibilite' => (bool) $profil->disponibilite,
                'photo' => $profil->photo ? asset('storage/' . $profil->photo) : null,
                'vues' => $profil->vues,
                // Infos de compte, en lecture ici (modifiables via /user, pas ce endpoint)
                'categorie' => $utilisateur->categorie->nom ?? null,
                'ville' => $utilisateur->ville,
                'statut' => $utilisateur->statut,
                'estComplet' => $profil->estComplet(),
            ],
        ]);
    }

    /**
     * Crée/complète le profil du talent connecté.
     * POST /api/talent/profil
     *
     * En POST (pas PUT) car multipart/form-data (upload photo) — même
     * convention que AuthController::register.
     */
    public function update(Request $request)
    {
        $this->assertTalent($request);

        $utilisateur = $request->user();
        $profil = $utilisateur->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tarif_min' => 'nullable|numeric|min:0',
            'tarif_max' => 'nullable|numeric|gte:tarif_min',
            'biographie' => 'nullable|string|max:2000',
            'disponibilite' => 'nullable|boolean',
            'photo' => 'nullable|file|image|mimes:jpeg,jpg,png|max:5120',
        ], [
            'tarif_max.gte' => 'Le tarif maximum doit être supérieur ou égal au tarif minimum.',
            'photo.image' => 'Le fichier doit être une image (JPG ou PNG).',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['tarif_min', 'tarif_max', 'biographie']);

        if ($request->has('disponibilite')) {
            $data['disponibilite'] = $request->boolean('disponibilite');
        }

        if ($request->hasFile('photo')) {
            // Supprime l'ancienne photo si elle existe, avant d'enregistrer la nouvelle
            if ($profil->photo) {
                Storage::disk('public')->delete($profil->photo);
            }

            $data['photo'] = $request->file('photo')->store('photos_talents', 'public');
        }

        $profil->update($data);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $profil->id,
                'tarif_min' => $profil->tarif_min,
                'tarif_max' => $profil->tarif_max,
                'biographie' => $profil->biographie,
                'disponibilite' => (bool) $profil->disponibilite,
                'photo' => $profil->photo ? asset('storage/' . $profil->photo) : null,
                'estComplet' => $profil->estComplet(),
            ],
        ]);
    }
}