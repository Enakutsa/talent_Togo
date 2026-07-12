import { useNavigate } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import "../../assets/styles/NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-bg">
      <div className="nf-wrap">

        {/* Illustration 404 */}
        <div className="nf-graphic">
          <div className="nf-number">404</div>
          <div className="nf-icon-wrap">
            <Search size={40} className="nf-icon" />
          </div>
        </div>

        <h1 className="nf-title">Page introuvable</h1>
        <p className="nf-sub">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Revenez à l&apos;accueil ou explorez nos talents.
        </p>

        <div className="nf-actions">
          <button onClick={() => navigate("/")} className="nf-btn-primary">
            <Home size={18} /> Accueil
          </button>
          <button onClick={() => navigate("/recherche")} className="nf-btn-outline">
            <Search size={18} /> Trouver un talent
          </button>
        </div>

        <button onClick={() => navigate(-1)} className="nf-back">
          <ArrowLeft size={14} /> Retour en arrière
        </button>
      </div>
    </div>
  );
}