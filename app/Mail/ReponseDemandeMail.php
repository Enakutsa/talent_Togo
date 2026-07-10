<?php

namespace App\Mail;

use App\Models\DemandePrestation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReponseDemandeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public DemandePrestation $demande,
        public ?string $motifRefus = null
    ) {}

    public function build()
    {
        $sujet = $this->demande->statut === 'acceptee'
            ? 'Votre demande a été acceptée - TalentTogo'
            : 'Votre demande a été refusée - TalentTogo';

        return $this->subject($sujet)
            ->view('emails.reponse-demande')
            ->with(['demande' => $this->demande, 'motifRefus' => $this->motifRefus]);
    }
}