<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TalentReactiveMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Utilisateur $talent;

    public function __construct(Utilisateur $talent)
    {
        $this->talent = $talent;
    }

    public function build()
    {
        return $this->subject('Votre compte TalentTogo a été réactivé')
            ->view('emails.talent-reactive')
            ->with([
                'talent' => $this->talent,
            ]);
    }
}