<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PortfolioController extends Controller
{
    // ⚠️ Pas d'injection dans le constructeur : CloudinaryService lève une
    // exception si CLOUDINARY_URL est absent, ce qui ferait planter TOUTES
    // les méthodes (y compris index(), qui n'a pourtant rien à voir avec
    // Cloudinary) dès l'instanciation du contrôleur. On ne le résout que
    // dans les méthodes qui en ont vraiment besoin (store, destroy).
    private function cloudinary(): CloudinaryService
    {
        return app(CloudinaryService::class);
    }

    private function assertTalent(Request $request): void
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');
    }

    /**
     * Liste les réalisations du talent connecté.
     * GET /api/talent/portfolio
     */
    public function index(Request $request)
    {
        $this->assertTalent($request);

        $profil = $request->user()->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $items = $profil->portfolios()->latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'media_url' => $item->media_url,
                'description' => $item->description,
                'created_at' => $item->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * Ajoute une réalisation (photo ou vidéo) au portfolio.
     * POST /api/talent/portfolio
     */
    public function store(Request $request)
    {
        $this->assertTalent($request);

        $profil = $request->user()->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'fichier' => 'required|file|mimes:jpeg,jpg,png,mp4,mov|max:20480',
            'description' => 'nullable|string|max:500',
        ], [
            'fichier.required' => 'Veuillez sélectionner une photo ou une vidéo.',
            'fichier.mimes' => 'Format non supporté (JPG, PNG, MP4, MOV uniquement).',
            'fichier.max' => 'Le fichier ne doit pas dépasser 20 Mo.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('fichier');
        $isVideo = str_starts_with($file->getMimeType(), 'video');
        $type = $isVideo ? 'video' : 'image'; // doit matcher l'enum de la migration ('image', 'video')

        try {
            $upload = $this->cloudinary()->upload(
                $file,
                'talenttogo/portfolios',
                $isVideo ? 'video' : 'image'
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Échec upload Cloudinary : ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Échec de l\'envoi du fichier. Réessayez ou contactez le support.',
                // En local uniquement, pour déboguer plus vite :
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 503);
        }

        $item = $profil->portfolios()->create([
            'type' => $type,
            'media_url' => $upload['url'],
            'public_id' => $upload['public_id'],
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $item->id,
                'type' => $item->type,
                'media_url' => $item->media_url,
                'description' => $item->description,
                'created_at' => $item->created_at,
            ],
        ], 201);
    }

    /**
     * Supprime une réalisation du portfolio.
     * DELETE /api/talent/portfolio/{id}
     */
    public function destroy(Request $request, $id)
    {
        $this->assertTalent($request);

        $profil = $request->user()->profilTalent;
        $item = Portfolio::where('profil_talent_id', $profil->id)->find($id);

        if (!$item) {
            return response()->json(['message' => 'Élément introuvable.'], 404);
        }

        try {
            $this->cloudinary()->delete($item->public_id, $item->type === 'video' ? 'video' : 'image');
        } catch (\RuntimeException $e) {
            // On supprime quand même la ligne en base même si Cloudinary
            // n'est pas joignable/configuré, pour ne pas bloquer le talent.
        }

        $item->delete();

        return response()->json(['success' => true]);
    }
}