import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { AlertTriangle, Clock, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";
import { initierPaiementAbonnement } from "../../services/abonnement.service";
import "../../assets/styles/AbonnementBanner.css";

export default function AbonnementBanner() {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "talent") {
    return null;
  }

  const handlePayer = async () => {
    try {
      const { payment_url } = await initierPaiementAbonnement();
      window.location.href = payment_url;
    } catch (err) {
      console.error("Erreur lors de l'initiation du paiement :", err);
      alert("Une erreur est survenue. Réessayez dans quelques instants.");
    }
  };

  // Plan payant choisi à l'inscription, pas encore réglé.
  if (user.plan_choisi === "payant" && !user.abonnement_expire_le) {
    return (
      <div className="abonnement-banner abonnement-banner-warning">
        <div className="abonnement-banner-icon">
          <CreditCard size={20} />
        </div>
        <div className="abonnement-banner-text">
          <strong>Activez votre visibilité.</strong> Vous avez choisi l'abonnement payant —
          réglez-le maintenant pour que votre profil soit visible par les clients.
        </div>
        <button onClick={handlePayer} className="abonnement-banner-btn">
          Payer maintenant
        </button>
      </div>
    );
  }

  if (!user.abonnement_expire_le) {
    return null;
  }

  const dateExpiration = new Date(user.abonnement_expire_le);
  const maintenant = new Date();
  const joursRestants = Math.ceil((dateExpiration - maintenant) / (1000 * 60 * 60 * 24));

  const estExpire = joursRestants <= 0;
  const estUrgent = joursRestants <= 7;
  // ✅ Vrai statut renvoyé par le backend (voir AuthController::me),
  // au lieu de le déduire à tort de la seule date restante.
  const estAbonnementPaye = user.abonnement_statut === "actif";

  const dateFormatee = dateExpiration.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Abonnement payé et actif, loin de l'expiration : message positif
  // dédié, plus jamais confondu avec l'essai gratuit.
  if (estAbonnementPaye && !estUrgent) {
    return (
      <div className="abonnement-banner abonnement-banner-actif">
        <div className="abonnement-banner-icon">
          <CheckCircle2 size={20} />
        </div>
        <div className="abonnement-banner-text">
          <strong>Abonnement actif</strong> jusqu'au {dateFormatee}. Votre profil est visible par
          les clients.
        </div>
      </div>
    );
  }

  // Essai gratuit, loin de l'expiration.
  if (!estAbonnementPaye && !estUrgent) {
    return (
      <div className="abonnement-banner abonnement-banner-info">
        <div className="abonnement-banner-icon">
          <Sparkles size={20} />
        </div>
        <div className="abonnement-banner-text">
          Vous êtes actuellement sur l'<strong>essai gratuit</strong> ({joursRestants} jours restants).
          Vous pouvez passer à l'abonnement payant à tout moment pour sécuriser votre visibilité.
        </div>
        <button onClick={handlePayer} className="abonnement-banner-btn abonnement-banner-btn-subtle">
          Passer au plan payant
        </button>
      </div>
    );
  }

  // Urgent (≤7 jours) ou expiré — que ce soit fin d'essai ou fin
  // d'abonnement payé, même traitement d'alerte.
  return (
    <div className={`abonnement-banner ${estExpire ? "abonnement-banner-expire" : "abonnement-banner-warning"}`}>
      <div className="abonnement-banner-icon">
        {estExpire ? <AlertTriangle size={20} /> : <Clock size={20} />}
      </div>
      <div className="abonnement-banner-text">
        {estExpire ? (
          <>
            <strong>Votre abonnement a expiré.</strong> Votre profil n'est plus visible par les
            clients. Renouvelez maintenant pour continuer à recevoir des demandes.
          </>
        ) : (
          <>
            <strong>Il vous reste {joursRestants} jour{joursRestants > 1 ? "s" : ""}</strong> avant
            la fin de votre {estAbonnementPaye ? "abonnement" : "période gratuite"}. Pensez à
            renouveler pour ne pas perdre en visibilité.
          </>
        )}
      </div>
      <button onClick={handlePayer} className="abonnement-banner-btn">
        {estExpire ? "Renouveler maintenant" : "S'abonner"}
      </button>
    </div>
  );
}