import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/AbonnementCallback.css";

export default function AbonnementCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);
  const [statut, setStatut] = useState("en_cours"); // en_cours | succes

  useEffect(() => {
    // ✅ Le webhook FedaPay met à jour la base de façon asynchrone,
    // parfois avec quelques secondes de décalage par rapport au retour
    // sur cette page. On attend un court délai, PUIS on recharge
    // explicitement le user depuis /user (refreshUser) pour que
    // AuthContext.user.abonnement_expire_le reflète la nouvelle date —
    // sans ça, le dashboard continuait d'afficher les anciennes données
    // de session (ex: "31 jours restants" de l'essai gratuit initial),
    // même après un paiement réussi.
    const timer = setTimeout(async () => {
      await refreshUser();
      setStatut("succes");
      setTimeout(() => navigate("/talent/dashboard"), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, refreshUser]);

  return (
    <div className="abonnement-callback">
      {statut === "en_cours" && (
        <>
          <Loader size={40} className="abonnement-callback-spin" />
          <h2>Vérification du paiement en cours...</h2>
          <p>Merci de patienter quelques instants.</p>
        </>
      )}
      {statut === "succes" && (
        <>
          <CheckCircle size={40} color="#166534" />
          <h2>Paiement en cours de traitement</h2>
          <p>Vous allez être redirigé vers votre tableau de bord.</p>
        </>
      )}
    </div>
  );
}