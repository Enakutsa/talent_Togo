<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TalentRejeteMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Utilisateur $talent;
    public ?string $motif;

    public function __construct(Utilisateur $talent, ?string $motif = null)
    {
        $this->talent = $talent;
        $this->motif = $motif;
    }

    public function build()
    {
        return $this->subject('Votre profil n\'a pas été validé')
            ->view('emails.talent-rejete')
            ->with([
                'talent' => $this->talent,
                'motif' => $this->motif,
            ]);
    }
}