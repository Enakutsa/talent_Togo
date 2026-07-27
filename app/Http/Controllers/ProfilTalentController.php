<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProfilTalentController extends Controller
{
    private function assertTalent(Request $request): void
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');
    }

    private function cloudinary(): CloudinaryService
    {
        return app(CloudinaryService::class);
    }

    /**
     * Construit l'URL affichable d'une photo, qu'elle soit une URL
     * Cloudinary complète (nouveau comportement par défaut) ou un
     * chemin de stockage local (anciennes photos non migrées).
     */
    private function resolvePhotoUrl(?string $photo): ?string
    {
        if (!$photo) {
            return null;
        }

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return asset('storage/' . $photo);
    }

    public function show(Request $request)
{
    $this->assertTalent($request);

    $utilisateur = $request->user();
    $profil = $utilisateur->profilTalent;

    if (!$profil) {
        return response()->json(['message' => 'Profil introuvable.'], 404);
    }

    $profil->load('utilisateur.categorie');

    $avisVisibles = $profil->avis()->where('statut', 'visible')->get();
    $nbAvis = $avisVisibles->count();
    $noteMoyenne = $nbAvis > 0 ? round($avisVisibles->avg('note'), 1) : 0;

    // ✅ Revenus estimés : somme des budgets des demandes de prestation
    // terminées pour ce talent. Basé sur demandes_prestation.budget, saisi
    // par le client à la demande — pas un montant "facturé" réel, d'où le
    // libellé "estimés" côté frontend.
    $revenusEstimes = $profil->demandesPrestation()
        ->where('statut', 'terminee')
        ->sum('budget');

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $profil->id,
            'tarif_min' => $profil->tarif_min,
            'tarif_max' => $profil->tarif_max,
            'biographie' => $profil->biographie,
            'disponibilite' => (bool) $profil->disponibilite,
            'photo' => $this->resolvePhotoUrl($profil->photo),
            'vues' => $profil->vues,
            'note' => $noteMoyenne,
            'nb_avis' => $nbAvis,
            'revenus_estimes' => (float) $revenusEstimes,
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
            'photo' => 'nullable|file|image|mimes:jpeg,jpg,png|max:10240', // 10 Mo
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

        $profilData = $request->only(['tarif_min', 'tarif_max', 'biographie']);

        if ($request->has('disponibilite')) {
            $profilData['disponibilite'] = $request->boolean('disponibilite');
        }

        if ($request->hasFile('photo')) {
            // ✅ Cloudinary plutôt que le disque local : le stockage local
            // de Render est éphémère (effacé à chaque déploiement), donc
            // toute photo de profil y disparaîtrait au prochain déploiement.
            if ($profil->photo_public_id) {
                $this->cloudinary()->delete($profil->photo_public_id, 'image');
            }

            try {
                $upload = $this->cloudinary()->upload(
                    $request->file('photo'),
                    'talenttogo/profils_talents',
                    'image'
                );
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => 'Échec de l\'envoi de la photo. Réessayez ou contactez le support.',
                    'debug' => config('app.debug') ? $e->getMessage() : null,
                ], 503);
            }

            $profilData['photo'] = $upload['url'];
            $profilData['photo_public_id'] = $upload['public_id'];
        }

        $profil->update($profilData);

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
                'photo' => $this->resolvePhotoUrl($profil->photo),
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