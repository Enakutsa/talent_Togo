@if($demande->statut === 'acceptee')
<h2>Votre demande a été acceptée !</h2>
<p>Bonne nouvelle, le talent a accepté votre demande de prestation.</p>
@else
<h2>Votre demande a été refusée</h2>
<p>Le talent n'a pas pu accepter votre demande.</p>
@if($motifRefus)
<p><strong>Motif :</strong> {{ $motifRefus }}</p>
@endif
@endif