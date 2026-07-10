<h2>Nouvelle demande de prestation</h2>
<p>Vous avez reçu une nouvelle demande sur TalentTogo :</p>
<p><strong>Message :</strong> {{ $demande->message_initial }}</p>
@if($demande->date_souhaitee)
<p><strong>Date souhaitée :</strong> {{ $demande->date_souhaitee->format('d/m/Y') }}</p>
@endif
@if($demande->budget)
<p><strong>Budget :</strong> {{ number_format($demande->budget, 0, ',', ' ') }} FCFA</p>
@endif
<p>Connectez-vous à votre tableau de bord pour répondre.</p>