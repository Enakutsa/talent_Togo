<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NouveauTalentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Utilisateur $talent;

    public function __construct(Utilisateur $talent)
    {
        $this->talent = $talent;
    }

    public function build()
    {
        return $this->subject('Nouveau talent en attente de validation')
            ->view('emails.nouveau-talent')
            ->with([
                'talent' => $this->talent,
            ]);
    }
}