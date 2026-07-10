import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin, CheckCircle, Heart } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { toggleFavori } from "../../services/favori.service";
import "../../assets/styles/TalentCard.css";

export default function TalentCard({
  id,
  nom,
  categorie,
  ville,
  note,
  avis,
  tarif,
  avatar,
  portfolio,
  disponible,
  competences = [],
  verifie = true,
  isFavorite,
  onToggleFavorite,
}) {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [liked, setLiked] = useState(!!isFavorite);
  const [togglingFav, setTogglingFav] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/talents/${id}` } });
      return;
    }

    if (togglingFav) return;
    setTogglingFav(true);

    // Optimistic update : on change l'affichage tout de suite,
    // on annule si l'appel échoue.
    const previous = liked;
    setLiked(!previous);

    try {
      const res = await toggleFavori(id);
      setLiked(res.is_favorite);
      onToggleFavorite?.(id);
    } catch {
      setLiked(previous); // rollback en cas d'échec
    } finally {
      setTogglingFav(false);
    }
  };

  const handleVoirProfil = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: `/talents/${id}` } });
    }
  };

  return (
    <div className="talent-card">
      <div className="talent-card-cover">
        <img src={portfolio} alt={nom} className="talent-card-cover-img" />
        <div className="talent-card-cover-gradient" />

        <button
          onClick={handleLike}
          className="talent-card-fav-btn"
          aria-label="Favori"
          disabled={togglingFav}
        >
          <Heart size={15} className={liked ? "talent-card-heart-liked" : "talent-card-heart"} />
        </button>

        <span className={`talent-card-dispo-badge ${disponible ? "dispo-badge-on" : "dispo-badge-off"}`}>
          {disponible ? "Disponible" : "Indisponible"}
        </span>
      </div>

      <div className="talent-card-body">
        <div className="talent-card-header">
          <div className="talent-card-avatar-wrap">
            <img src={avatar} alt={nom} className="talent-card-avatar" />
            {disponible && <span className="talent-card-online-dot" />}
          </div>
          <div className="talent-card-identity">
            <div className="talent-card-name-row">
              <h3 className="talent-card-name">{nom}</h3>
              {verifie && <CheckCircle size={14} className="talent-card-verified-icon" />}
            </div>
            <div className="talent-card-meta-row">
              <span className="talent-card-category">{categorie}</span>
              <span className="talent-card-meta-dot">·</span>
              <span className="talent-card-city">
                <MapPin size={11} />
                {ville}
              </span>
            </div>
          </div>
        </div>

        <div className="talent-card-rating">
          <Star size={13} className="talent-card-star" />
          <span className="talent-card-rating-value">{note}</span>
          <span className="talent-card-rating-count">({avis} avis)</span>
        </div>

        {competences.length > 0 && (
          <div className="talent-card-skills">
            {competences.slice(0, 3).map((skill) => (
              <span key={skill} className="talent-card-skill-tag">
                {skill}
              </span>
            ))}
            {competences.length > 3 && (
              <span className="talent-card-skill-more">+{competences.length - 3}</span>
            )}
          </div>
        )}

        <div className="talent-card-footer">
          <div>
            <span className="talent-card-price-label">À partir de</span>
            <p className="talent-card-price-value">
              {Number(tarif).toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <a href={`/talents/${id}`} onClick={handleVoirProfil} className="talent-card-cta">
            Voir profil
          </a>
        </div>
      </div>
    </div>
  );
}