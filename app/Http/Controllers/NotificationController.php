<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Liste des notifications de l'utilisateur connecté (20 plus récentes).
     * GET /api/notifications
     */
    public function index(Request $request)
    {
        $notifications = Notification::where('utilisateur_id', $request->user()->id)
            ->latest()
            ->limit(20)
            ->get();

        $nonLues = Notification::where('utilisateur_id', $request->user()->id)
            ->where('lu', false)
            ->count();

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'non_lues' => $nonLues,
        ]);
    }

    /**
     * Marque une notification comme lue.
     * PATCH /api/notifications/{id}/lu
     */
    public function marquerLue(Request $request, $id)
    {
        $notification = Notification::where('id', $id)
            ->where('utilisateur_id', $request->user()->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification introuvable.'], 404);
        }

        $notification->update(['lu' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Marque toutes les notifications comme lues.
     * PATCH /api/notifications/tout-lire
     */
    public function toutMarquerLu(Request $request)
    {
        Notification::where('utilisateur_id', $request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['success' => true]);
    }
}