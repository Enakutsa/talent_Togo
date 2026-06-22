import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, CheckCircle, Heart } from "lucide-react";
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
  const [liked, setLiked] = useState(!!isFavorite);

  const handleLike = () => {
    setLiked(!liked);
    onToggleFavorite?.(id);
  };

  return (
    <div className="talent-card">
      {/* Cover */}
      <div className="talent-card-cover">
        <img src={portfolio} alt={nom} className="talent-card-cover-img" />
        <div className="talent-card-cover-gradient" />

        <button onClick={handleLike} className="talent-card-fav-btn" aria-label="Favori">
          <Heart size={15} className={liked ? "talent-card-heart-liked" : "talent-card-heart"} />
        </button>

        <span className="talent-card-category-badge">{categorie}</span>
      </div>

      {/* Body */}
      <div className="talent-card-body">
        {/* Avatar + name */}
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
            <div className="talent-card-city">
              <MapPin size={11} />
              <span>{ville}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="talent-card-rating">
          <Star size={13} className="talent-card-star" />
          <span className="talent-card-rating-value">{note}</span>
          <span className="talent-card-rating-count">({avis} avis)</span>
        </div>

        {/* Skills */}
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

        {/* Footer */}
        <div className="talent-card-footer">
          <div>
            <span className="talent-card-price-label">À partir de</span>
            <p className="talent-card-price-value">
              {Number(tarif).toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <Link to={`/talents/${id}`} className="talent-card-cta">
            Voir profil
          </Link>
        </div>
      </div>
    </div>
  );
}