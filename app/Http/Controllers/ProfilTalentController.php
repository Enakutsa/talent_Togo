<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

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
     * Récupère le profil du talent connecté.
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
                // Infos de compte — désormais modifiables via ce même endpoint
                'prenom' => $utilisateur->prenom,
                'nom' => $utilisateur->nom,
                'email' => $utilisateur->email,
                'telephone' => $utilisateur->telephone,
                'categorie_id' => $utilisateur->categorie_id,
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
            // Infos professionnelles
            'tarif_min' => 'nullable|numeric|min:0',
            'tarif_max' => 'nullable|numeric|gte:tarif_min',
            'biographie' => 'nullable|string|max:2000',
            'disponibilite' => 'nullable|boolean',
            'photo' => 'nullable|file|image|mimes:jpeg,jpg,png|max:5120',
            // Infos de compte
            'prenom' => 'nullable|string|max:255',
            'nom' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'email',
                Rule::unique('users', 'email')->ignore($utilisateur->id),
            ],
            'telephone' => 'nullable|digits:8',
            'categorie_id' => 'nullable|exists:categories,id',
            'ville' => 'nullable|string|max:255',
        ], [
            'tarif_max.gte' => 'Le tarif maximum doit être supérieur ou égal au tarif minimum.',
            'photo.image' => 'Le fichier doit être une image (JPG ou PNG).',
            'email.unique' => 'Cet email est déjà utilisé par un autre compte.',
            'telephone.digits' => 'Le téléphone doit contenir exactement 8 chiffres.',
            'categorie_id.exists' => 'Catégorie invalide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ── Mise à jour du profil pro ──
        $profilData = $request->only(['tarif_min', 'tarif_max', 'biographie']);

        if ($request->has('disponibilite')) {
            $profilData['disponibilite'] = $request->boolean('disponibilite');
        }

        if ($request->hasFile('photo')) {
            if ($profil->photo) {
                Storage::disk('public')->delete($profil->photo);
            }
            $profilData['photo'] = $request->file('photo')->store('photos_talents', 'public');
        }

        $profil->update($profilData);

        // ── Mise à jour des infos de compte ──
        $utilisateurData = $request->only(['prenom', 'nom', 'email', 'telephone', 'categorie_id', 'ville']);
        $utilisateurData = array_filter($utilisateurData, fn($v) => $v !== null && $v !== '');

        if (!empty($utilisateurData)) {
            $utilisateur->update($utilisateurData);
        }

        $utilisateur->refresh();
        $profil->refresh();
        $utilisateur->load('categorie');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $profil->id,
                'tarif_min' => $profil->tarif_min,
                'tarif_max' => $profil->tarif_max,
                'biographie' => $profil->biographie,
                'disponibilite' => (bool) $profil->disponibilite,
                'photo' => $profil->photo ? asset('storage/' . $profil->photo) : null,
                'prenom' => $utilisateur->prenom,
                'nom' => $utilisateur->nom,
                'email' => $utilisateur->email,
                'telephone' => $utilisateur->telephone,
                'categorie_id' => $utilisateur->categorie_id,
                'categorie' => $utilisateur->categorie->nom ?? null,
                'ville' => $utilisateur->ville,
                'estComplet' => $profil->estComplet(),
            ],
        ]);
    }
}