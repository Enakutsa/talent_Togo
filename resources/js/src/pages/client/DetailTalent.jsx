import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star, MapPin, Heart, MessageSquare, ArrowLeft,
  Check, Award, Clock, User, Loader, Send, Calendar, Wallet, Flag
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { getTalentById } from "../../services/talent.service";
import { envoyerDemande } from "../../services/demande.service";
import { signalerTalent } from "../../services/signalement.service";
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

// ✅ Nombre maximum d'avis affichés sur la page de détail, pour ne pas
// surcharger la page quand un talent a beaucoup d'avis.
const MAX_AVIS_AFFICHES = 5;

export default function DetailTalent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const [talent, setTalent]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [isFav, setIsFav]             = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [previewIdx, setPreviewIdx]   = useState(null);

  // ── Formulaire de demande ──
  const [messageInitial, setMessageInitial] = useState("");
  const [dateSouhaitee, setDateSouhaitee]   = useState("");
  const [budget, setBudget]                 = useState("");
  const [sending, setSending]               = useState(false);
  const [sendError, setSendError]           = useState("");
  const [sent, setSent]                     = useState(false);

  // ── Formulaire de signalement ──
  const [showReport, setShowReport]             = useState(false);
  const [reportMotif, setReportMotif]           = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSending, setReportSending]       = useState(false);
  const [reportError, setReportError]           = useState("");
  const [reportSent, setReportSent]             = useState(false);

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

  const handleSend = async () => {
    if (!messageInitial.trim()) return;

    // ✅ Le budget proposé ne peut pas être inférieur au tarif minimum
    // fixé par le talent sur son profil.
    if (budget && Number(budget) < tarif) {
      setSendError(`Le budget ne peut pas être inférieur au tarif minimum de ${tarif.toLocaleString("fr-FR")} FCFA.`);
      return;
    }

    setSendError("");
    setSending(true);

    try {
      await envoyerDemande({
        profil_talent_id: talent.id,
        message_initial: messageInitial,
        date_souhaitee: dateSouhaitee || null,
        budget: budget || null,
      });
      setSent(true);
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0]?.[0];
        setSendError(firstError || "Certains champs sont invalides.");
      } else {
        setSendError(err.response?.data?.message || "Une erreur est survenue. Réessayez.");
      }
    } finally {
      setSending(false);
    }
  };

  const resetModal = () => {
    setShowContact(false);
    setSent(false);
    setMessageInitial("");
    setDateSouhaitee("");
    setBudget("");
    setSendError("");
  };

  const handleMessage = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate(`/client/messages?talent_id=${talent.id}`);
  };

  // ── Signalement ──
  const MOTIFS = [
    { value: "contenu_inapproprie", label: "Contenu inapproprié" },
    { value: "faux_profil", label: "Faux profil" },
    { value: "arnaque", label: "Arnaque / fraude" },
    { value: "comportement_abusif", label: "Comportement abusif" },
    { value: "autre", label: "Autre" },
  ];

  const handleReport = async () => {
    if (!reportMotif) return;

    setReportError("");
    setReportSending(true);

    try {
      await signalerTalent({
        profil_talent_id: talent.id,
        motif: reportMotif,
        description: reportDescription || null,
      });
      setReportSent(true);
    } catch (err) {
      setReportError(err.response?.data?.message || "Impossible d'envoyer le signalement.");
    } finally {
      setReportSending(false);
    }
  };

  const resetReportModal = () => {
    setShowReport(false);
    setReportSent(false);
    setReportMotif("");
    setReportDescription("");
    setReportError("");
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

  const note        = talent.note        ?? 0;
  const nbAvis      = talent.avis        ?? 0;
  const disponible  = talent.disponible  ?? false;
  const tarif       = Number(talent.tarif    ?? talent.tarif_min ?? 0);
  const tarifMax    = Number(talent.tarif_max ?? 0);
  const portfolio   = talent.portfolios  ?? [];
  const avisListe   = talent.avis_liste  ?? [];
  const avatar      = talent.avatar      ?? null;

  // ✅ On n'affiche que les 5 avis les plus récents, pour ne pas surcharger
  // la page. Le backend (TalentController::formatTalentDetail) trie déjà
  // avis_liste du plus récent au plus ancien, donc ce sont bien les 5
  // derniers — et ça se met à jour automatiquement à chaque nouvel avis.
  const MAX_AVIS_AFFICHES = 5;
  const avisAffiches = avisListe.slice(0, MAX_AVIS_AFFICHES);

  const todayStr = new Date().toISOString().split("T")[0];

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
                        src={p.url ?? p.media_url}
                        alt={p.titre ?? `Photo ${i + 1}`}
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
                <>
                  <div className="dt-avis-list">
                    {avisAffiches.map((a, i) => (
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
                        <p className="dt-avis-text">{a.commentaire ?? a.text}</p>
                      </div>
                    ))}
                  </div>

                  {avisListe.length > MAX_AVIS_AFFICHES && (
                    <p className="dt-avis-more">
                      + {avisListe.length - MAX_AVIS_AFFICHES} autre{avisListe.length - MAX_AVIS_AFFICHES > 1 ? "s" : ""} avis
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="dt-sidebar-col">
            <div className="dt-booking-card">

              {/* Tarifs */}
              <div className="dt-tarif-block">
                <p className="dt-tarif-label">À partir de</p>
                <p className="dt-tarif-value">
                  {tarif.toLocaleString("fr-FR")} <span className="dt-tarif-unit">FCFA</span>
                </p>
                {tarifMax > 0 && (
                  <p className="dt-tarif-max">Jusqu'à {tarifMax.toLocaleString("fr-FR")} FCFA</p>
                )}
              </div>

              {/* Infos */}
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

              {/* ✅ Bouton Demande de prestation */}
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate("/login"); return; }
                  setShowContact(true);
                }}
                className="dt-contact-btn"
              >
                <Check size={18} /> Demander une prestation
              </button>

              {/* ✅ Bouton Messagerie interne */}
              <button
                onClick={handleMessage}
                className="dt-message-btn"
              >
                <MessageSquare size={16} /> Envoyer un message
              </button>

              {/* Bouton favori */}
              <button
                onClick={() => setIsFav(!isFav)}
                className={`dt-fav-card-btn ${isFav ? "dt-fav-card-active" : ""}`}
              >
                <Heart size={16} className={isFav ? "dt-heart-filled" : ""} />
                {isFav ? "Retiré des favoris" : "Ajouter aux favoris"}
              </button>

              {/* ✅ Bouton Signaler */}
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate("/login"); return; }
                  setShowReport(true);
                }}
                className="dt-report-btn"
              >
                <Flag size={14} /> Signaler ce profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal demande de prestation ── */}
      {showContact && (
        <div className="dt-modal-overlay" onClick={() => !sent && resetModal()}>
          <div className="dt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h2 className="dt-modal-title">Demande de prestation — {talent.nom}</h2>
            </div>

            {sent ? (
              <div className="dt-modal-success">
                <div className="dt-success-icon"><Check size={28} /></div>
                <h3 className="dt-success-title">Demande envoyée !</h3>
                <p className="dt-success-text">{talent.nom} recevra votre demande et vous répondra bientôt.</p>
                <button onClick={resetModal} className="dt-success-btn">
                  Fermer
                </button>
              </div>
            ) : (
              <div className="dt-modal-body">
                {sendError && <p className="dt-modal-error">{sendError}</p>}

                <div className="dt-modal-field">
                  <label className="dt-modal-label">
                    Votre message <span className="dt-modal-required">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez votre projet : type de prestation, lieu, détails..."
                    className="dt-modal-textarea"
                    value={messageInitial}
                    onChange={(e) => setMessageInitial(e.target.value)}
                  />
                </div>

                <div className="dt-modal-row">
                  <div className="dt-modal-field">
                    <label className="dt-modal-label">
                      <Calendar size={13} /> Date souhaitée
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      className="dt-modal-input"
                      value={dateSouhaitee}
                      onChange={(e) => setDateSouhaitee(e.target.value)}
                    />
                  </div>
                  <div className="dt-modal-field">
                    <label className="dt-modal-label">
                      <Wallet size={13} /> Budget (FCFA)
                    </label>
                    <input
                      type="number"
                      min={tarif}
                      placeholder={`Min. ${tarif.toLocaleString("fr-FR")}`}
                      className="dt-modal-input"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                    <p className="dt-modal-hint">
                      Tarif minimum du talent : {tarif.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>

                <div className="dt-modal-actions">
                  <button onClick={resetModal} className="dt-modal-cancel">Annuler</button>
                  <button
                    onClick={handleSend}
                    disabled={!messageInitial.trim() || sending || (budget && Number(budget) < tarif)}
                    className="dt-modal-send"
                  >
                    {sending ? "Envoi..." : <><Send size={14} /> Envoyer</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal signalement ── */}
      {showReport && (
        <div className="dt-modal-overlay" onClick={() => !reportSent && resetReportModal()}>
          <div className="dt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dt-modal-header">
              <h2 className="dt-modal-title">Signaler {talent.nom}</h2>
            </div>

            {reportSent ? (
              <div className="dt-modal-success">
                <div className="dt-success-icon"><Check size={28} /></div>
                <h3 className="dt-success-title">Signalement envoyé</h3>
                <p className="dt-success-text">Notre équipe va examiner ce profil.</p>
                <button onClick={resetReportModal} className="dt-success-btn">Fermer</button>
              </div>
            ) : (
              <div className="dt-modal-body">
                {reportError && <p className="dt-modal-error">{reportError}</p>}

                <div className="dt-modal-field">
                  <label className="dt-modal-label">
                    Motif <span className="dt-modal-required">*</span>
                  </label>
                  <select
                    className="dt-modal-input"
                    value={reportMotif}
                    onChange={(e) => setReportMotif(e.target.value)}
                  >
                    <option value="">Sélectionnez un motif</option>
                    {MOTIFS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="dt-modal-field">
                  <label className="dt-modal-label">Détails (facultatif)</label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez le problème rencontré..."
                    className="dt-modal-textarea"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  />
                </div>

                <div className="dt-modal-actions">
                  <button onClick={resetReportModal} className="dt-modal-cancel">Annuler</button>
                  <button
                    onClick={handleReport}
                    disabled={!reportMotif || reportSending}
                    className="dt-modal-send dt-modal-send-danger"
                  >
                    {reportSending ? "Envoi..." : <><Flag size={14} /> Signaler</>}
                  </button>
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
            src={portfolio[previewIdx]?.url ?? portfolio[previewIdx]?.media_url}
            alt=""
            className="dt-preview-img"
          />
        </div>
      )}
    </div>
  );
}