import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CreditCard, ShieldCheck } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { initierPaiementAbonnement } from "../../services/abonnement.service";
import "../../assets/styles/PaiementAbonnement.css";

export default function PaiementAbonnement() {
  const { logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayer = async () => {
    setError("");
    setLoading(true);
    try {
      const { payment_url } = await initierPaiementAbonnement();
      window.location.href = payment_url;
    } catch (err) {
      console.error("Erreur lors de l'initiation du paiement :", err);
      setError("Une erreur est survenue. Réessayez dans quelques instants.");
      setLoading(false);
    }
  };

  return (
    <div className="paiement-abo-bg">
      <div className="paiement-abo-card">
        <div className="paiement-abo-icon">
          <CreditCard size={26} />
        </div>

        <h1 className="paiement-abo-title">Activez votre abonnement</h1>
        <p className="paiement-abo-text">
          Vous avez choisi le plan payant lors de votre inscription. Réglez votre abonnement mensuel
          pour rendre votre profil visible auprès des clients et accéder à la plateforme.
        </p>

        {error && <p className="paiement-abo-error">{error}</p>}

        <button
          onClick={handlePayer}
          className="paiement-abo-btn"
          disabled={loading}
        >
          {loading ? <span className="paiement-abo-spinner" /> : "Payer mon abonnement"}
        </button>

        <p className="paiement-abo-secure">
          <ShieldCheck size={14} /> Paiement sécurisé via FedaPay
        </p>

        <button onClick={logout} className="paiement-abo-logout">
          Se déconnecter
        </button>
      </div>
    </div>
  );
}