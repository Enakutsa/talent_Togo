import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Heart, MessageSquare, ArrowLeft,
  Check, Award, Clock, User, Loader
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getTalentById } from "../../services/talent.service";
import "../../assets/styles/DetailTalent.css";

// ── Composant étoiles ──────────────────────────────────────────────────────
function Stars({ note, size = 14 }) {
  return (
    <span className="dt-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(note) ? "dt-star-filled" : "dt-star-empty"}
        />
      ))}
    </span>
  );
}

export default function DetailTalent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [talent, setTalent]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [isFav, setIsFav]           = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [msg, setMsg]               = useState("");
  const [sent, setSent]             = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);

  // ── Chargement du talent ────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTalentById(id)
      .then((res) => {
        const data = res?.data ?? res;
        setTalent(data);
      })
      .catch(() => setError("Impossible de charger ce profil."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSend = () => {
    if (!msg.trim()) return;
    setSent(true);
  };

  // ── États ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dt-loading">
        <Loader size={32} className="dt-spinner" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="dt-error">
        <p>{error || "Talent introuvable."}</p>
        <button onClick={() => navigate(-1)} className="dt-back-btn">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    );
  }

  // Valeurs avec fallback
  const note        = talent.note        ?? 0;
  const nbAvis      = talent.avis        ?? 0;
  const disponible  = talent.disponible  ?? false;
  const tarif       = Number(talent.tarif    ?? talent.tarif_min ?? 0);
  const tarifMax    = Number(talent.tarif_max ?? 0);
  const portfolio   = talent.portfolios  ?? [];
  const avisListe   = talent.avis_liste  ?? [];
  const competences = talent.competences ?? [];
  const avatar      = talent.avatar      ?? null;

  return (
    <div className="dt-bg">

      {/* Breadcrumb */}
      <div className="dt-breadcrumb-wrap">
        <button onClick={() => navigate(-1)} className="dt-back-btn">
          <ArrowLeft size={16} /> Retour aux résultats
        </button>
      </div>

      <div className="dt-container">
        <div className="dt-grid">

          {/* ── Colonne principale ── */}
          <div className="dt-main-col">

            {/* Profil header */}
            <div className="dt-card">
              <div className="dt-profile-row">
                <div className="dt-avatar-wrap">
                  {avatar
                    ? <img src={avatar} alt={talent.nom} className="dt-avatar" />
                    : <div className="dt-avatar-placeholder"><User size={32} /></div>
                  }
                  {disponible && <div className="dt-online-dot" />}
                </div>

                <div className="dt-profile-info">
                  <div className="dt-profile-top">
                    <div>
                      <h1 className="dt-nom">{talent.nom}</h1>
                      <span className="dt-categorie-badge">{talent.categorie}</span>
                    </div>
                    <button
                      onClick={() => setIsFav(!isFav)}
                      className={`dt-fav-btn ${isFav ? "dt-fav-active" : ""}`}
                    >
                      <Heart size={18} className={isFav ? "dt-heart-filled" : "dt-heart"} />
                    </button>
                  </div>

                  <div className="dt-meta-row">
                    <div className="dt-meta-item">
                      <Stars note={note} />
                      <span className="dt-note-val">{note}</span>
                      <span className="dt-note-count">({nbAvis} avis)</span>
                    </div>
                    <div className="dt-meta-item">
                      <MapPin size={14} /> {talent.ville}
                    </div>
                    {talent.experience && (
                      <div className="dt-meta-item">
                        <Award size={14} /> {talent.experience} ans d'expérience
                      </div>
                    )}
                    <span className={`dt-dispo-badge ${disponible ? "dt-dispo-on" : "dt-dispo-off"}`}>
                      <div className={`dt-dispo-dot-sm ${disponible ? "dot-on" : "dot-off"}`} />
                      {disponible ? "Disponible" : "Indisponible"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {talent.biographie && (
                <div className="dt-section">
                  <h2 className="dt-section-title">À propos</h2>
                  <p className="dt-bio">{talent.biographie}</p>
                </div>
              )}

              {/* Compétences */}
              {competences.length > 0 && (
                <div className="dt-section">
                  <h2 className="dt-section-title">Compétences</h2>
                  <div className="dt-skills">
                    {competences.map((c) => (
                      <span key={c} className="dt-skill-tag">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="dt-card">
                <h2 className="dt-section-title">Portfolio</h2>
                <div className="dt-portfolio-grid">
                  {portfolio.map((p, i) => (
                    <div
                      key={i}
                      className="dt-portfolio-item"
                      onClick={() => setPreviewIdx(i)}
                    >
                      <img
                        src={p.url ?? p.chemin}
                        alt={p.titre ?? p.title ?? `Photo ${i + 1}`}
                        className="dt-portfolio-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis */}
            <div className="dt-card">
              <div className="dt-avis-header">
                <h2 className="dt-section-title">
                  Avis clients <span className="dt-avis-count">({nbAvis})</span>
                </h2>
                <div className="dt-avis-global">
                  <Stars note={note} size={16} />
                  <span className="dt-note-val">{note}/5</span>
                </div>
              </div>

              {avisListe.length === 0 ? (
                <p className="dt-no-avis">Aucun avis pour le moment.</p>
              ) : (
                <div className="dt-avis-list">
                  {avisListe.map((a, i) => (
                    <div key={i} className="dt-avis-row">
                      <div className="dt-avis-author">
                        {a.avatar
                          ? <img src={a.avatar} alt={a.client} className="dt-avis-avatar" />
                          : <div className="dt-avis-avatar-placeholder">{(a.client ?? "?")[0]}</div>
                        }
                        <div>
                          <p className="dt-avis-name">{a.client}</p>
                          <div className="dt-avis-meta">
                            <Stars note={a.note} size={12} />
                            <span className="dt-avis-date">{a.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="dt-avis-text">{a.text ?? a.commentaire}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="dt-sidebar-col">
            <div className="dt-booking-card">
              <div className="dt-tarif-block">
                <p className="dt-tarif-label">À partir de</p>
                <p className="dt-tarif-value">
                  {tarif.toLocaleString("fr-FR")} <span className="dt-tarif-unit">FCFA</span>
                </p>
                {tarifMax > 0 && (
                  <p className="dt-tarif-max">Jusqu'à {tarifMax.toLocaleString("fr-FR")} FCFA</p>
                )}
              </div>

              <div className="dt-infos-list">
                {[
                  { label: "Temps de réponse", val: "< 2 heures", icon: Clock },
                  { label: "Projets réalisés",  val: talent.projets ?? "—",  icon: Check },
                  { label: "Satisfaction",       val: nbAvis > 0 ? `${Math.round(note * 20)}%` : "—", icon: Star },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="dt-info-row">
                    <div className="dt-info-left">
                      <Icon size={14} className="dt-info-icon" /> {label}
                    </div>
                    <span className="dt-info-val">{val}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate("/login"); return; }
                  setShowContact(true);
                }}
                className="dt-contact-btn"
              >
                <MessageSquare size={18} /> Contacter
              </button>

              <button
                onClick={() => setIsFav(!isFav)}
                className={`dt-fav-card-btn ${isFav ? "dt-fav-card-active" : ""}`}
              >
                <Heart size={16} className={isFav ? "dt-heart-filled" : ""} />
                {isFav ? "Retiré des favoris" : "Ajouter aux favoris"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal contact ── */}
      {showContact && (
        <div className="dt-modal-overlay" onClick={() => !sent && setShowContact(false)}>
          <div className="dt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h2 className="dt-modal-title">Contacter {talent.nom}</h2>
            </div>

            {sent ? (
              <div className="dt-modal-success">
                <div className="dt-success-icon"><Check size={28} /></div>
                <h3 className="dt-success-title">Demande envoyée !</h3>
                <p className="dt-success-text">{talent.nom} recevra votre message et vous répondra bientôt.</p>
                <button onClick={() => { setShowContact(false); setSent(false); setMsg(""); }} className="dt-success-btn">
                  Fermer
                </button>
              </div>
            ) : (
              <div className="dt-modal-body">
                <textarea
                  rows={5}
                  placeholder="Décrivez votre projet : type de prestation, date souhaitée, budget, lieu..."
                  className="dt-modal-textarea"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
                <div className="dt-modal-actions">
                  <button onClick={() => setShowContact(false)} className="dt-modal-cancel">Annuler</button>
                  <button onClick={handleSend} disabled={!msg.trim()} className="dt-modal-send">Envoyer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Preview portfolio ── */}
      {previewIdx !== null && (
        <div className="dt-preview-overlay" onClick={() => setPreviewIdx(null)}>
          <img
            src={portfolio[previewIdx]?.url ?? portfolio[previewIdx]?.chemin}
            alt=""
            className="dt-preview-img"
          />
        </div>
      )}
    </div>
  );
}