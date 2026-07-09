<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Cloudinary\Cloudinary;
use RuntimeException;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $cloudUrl = config('cloudinary.cloud_url');

        if (empty($cloudUrl)) {
            throw new RuntimeException(
                'CLOUDINARY_URL est manquant. Vérifiez votre fichier .env.'
            );
        }

        $this->cloudinary = new Cloudinary($cloudUrl);
    }

    /**
     * Upload un fichier vers Cloudinary et renvoie l'URL + le public_id.
     *
     * @param UploadedFile $file
     * @param string $folder Dossier Cloudinary (ex: 'talenttogo/portfolios')
     * @param string $resourceType 'image' ou 'video'
     * @return array{url: string, public_id: string}
     */
    public function upload(UploadedFile $file, string $folder, string $resourceType = 'image'): array
    {
        $result = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => $folder,
            'resource_type' => $resourceType,
            'timeout' => 30, // évite d'attendre 60s en cas de coupure réseau
        ]);

        return [
            'url' => $result['secure_url'],
            'public_id' => $result['public_id'],
        ];
    }

    /**
     * Supprime un fichier Cloudinary via son public_id.
     */
    public function delete(string $publicId, string $resourceType = 'image'): void
    {
        try {
            $this->cloudinary->uploadApi()->destroy($publicId, [
                'resource_type' => $resourceType,
            ]);
        } catch (\Exception $e) {
            Log::warning("Échec suppression Cloudinary [{$publicId}] : " . $e->getMessage());
        }
    }
}