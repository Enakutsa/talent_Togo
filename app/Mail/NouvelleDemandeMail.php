<?php

namespace App\Mail;

use App\Models\DemandePrestation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NouvelleDemandeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public DemandePrestation $demande) {}

    public function build()
    {
        return $this->subject('Nouvelle demande de prestation - TalentTogo')
            ->view('emails.nouvelle-demande')
            ->with(['demande' => $this->demande]);
    }
}