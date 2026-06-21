import { useNavigate } from "react-router-dom";
import { Star, MapPin, Heart } from "lucide-react";
import "../../assets/styles/Home.css";

function Stars({ note }) {
  return (
    <span className="talent-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(note) ? "talent-star-filled" : "talent-star-empty"}
        />
      ))}
    </span>
  );
}

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
  disponible = true,
  isFavorite = false,
  onToggleFavorite,
}) {
  const navigate = useNavigate();

  return (
    <div className="talent-card" onClick={() => navigate(`/talents/${id}`)}>
      {/* Cover */}
      <div className="talent-card-cover">
        {portfolio && <img src={portfolio} alt={`Portfolio de ${nom}`} />}

        {/* Dispo badge */}
        <div className="talent-card-badge-wrap">
          <span className={disponible ? "talent-badge-available" : "talent-badge-unavailable"}>
            {disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>

        {/* Favorite */}
        <button
          className="talent-heart-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(id);
          }}
          aria-label="Ajouter aux favoris"
        >
          <Heart size={15} className={isFavorite ? "talent-heart-filled" : "talent-heart-empty"} />
        </button>
      </div>

      {/* Content */}
      <div className="talent-card-content">
        <div className="talent-card-top">
          <img src={avatar} alt={nom} className="talent-card-avatar" />
          <div className="talent-card-info">
            <h3 className="talent-card-name">{nom}</h3>
            <span className="talent-card-category">{categorie}</span>
          </div>
        </div>

        <div className="talent-card-rating">
          <Stars note={note} />
          <span className="talent-card-rating-value">{note.toFixed(1)}</span>
          <span className="talent-card-rating-count">({avis} avis)</span>
        </div>

        <div className="talent-card-location">
          <MapPin size={12} />
          <span>{ville}</span>
        </div>

        <div className="talent-card-footer">
          <div>
            <span className="talent-card-price-label">À partir de</span>
            <p className="talent-card-price">{tarif.toLocaleString("fr-FR")} FCFA</p>
          </div>
          <button
            className="talent-card-cta"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/talents/${id}`);
            }}
          >
            Voir profil
          </button>
        </div>
      </div>
    </div>
  );
}