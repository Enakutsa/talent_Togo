import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Calendar, Wallet, X, Loader2, Paperclip } from "lucide-react";
import { getDemandesRecues, repondreDemande } from "../../services/demande.service";
import { uploadDirectToCloudinary } from "../../services/cloudinaryDirect.service";
import TalentTopNav from "../../components/TalentTopNav";
import "../../assets/styles/TalentDashboard.css";
import "../../assets/styles/DemandesRecues.css";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", cls: "dr-badge-pending", icon: Clock },
  acceptee: { label: "Acceptée", cls: "dr-badge-accepted", icon: CheckCircle },
  refusee: { label: "Refusée", cls: "dr-badge-rejected", icon: XCircle },
  terminee: { label: "Terminée", cls: "dr-badge-terminee", icon: CheckCircle },
};

const FILTERS = [
  { key: "toutes", label: "Total", cardCls: "dr-summary-total" },
  { key: "en_attente", label: "En attente", cardCls: "dr-summary-pending" },
  { key: "acceptee", label: "Acceptées", cardCls: "dr-summary-accepted" },
  { key: "refusee", label: "Refusées", cardCls: "dr-summary-rejected" },
  { key: "terminee", label: "Terminées", cardCls: "dr-summary-terminee" },
];

const MOTIF_MAX_LENGTH = 300;
const LIVRABLE_MESSAGE_MAX_LENGTH = 500;

export default function DemandesRecues() {
  const [demandes, setDemandes] = useState(null);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [motifModal, setMotifModal] = useState(null);
  const [motif, setMotif] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [confirmingRefus, setConfirmingRefus] = useState(false);

  const [livrableModal, setLivrableModal] = useState(null);
  const [livrableFile, setLivrableFile] = useState(null);
  const [livrableMessage, setLivrableMessage] = useState("");
  const [livrableUploading, setLivrableUploading] = useState(false);
  const [livrableError, setLivrableError] = useState("");

  useEffect(() => {
    getDemandesRecues()
      .then((res) => setDemandes(res.data || []))
      .catch(() => setError("Impossible de charger vos demandes."));
  }, []);

  const closeMotifModal = useCallback(() => {
    if (confirmingRefus) return;
    setMotifModal(null);
  }, [confirmingRefus]);

  const closeLivrableModal = useCallback(() => {
    if (livrableUploading) return;
    setLivrableModal(null);
    setLivrableFile(null);
    setLivrableMessage("");
    setLivrableError("");
  }, [livrableUploading]);

  useEffect(() => {
    if (!motifModal && !livrableModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (motifModal) closeMotifModal();
        if (livrableModal) closeLivrableModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [motifModal, livrableModal, closeMotifModal, closeLivrableModal]);

  const handleAccepter = async (id) => {
    setRespondingId(id);
    setError("");
    try {
      await repondreDemande(id, "acceptee");
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "acceptee" } : d)));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'accepter cette demande.");
    } finally {
      setRespondingId(null);
    }
  };

  const ouvrirLivrableModal = (demande) => {
    setLivrableModal(demande);
    setLivrableFile(null);
    setLivrableMessage("");
    setLivrableError("");
  };

  const confirmerLivrable = async () => {
    if (!livrableModal) return;
    if (!livrableFile) {
      setLivrableError("Veuillez joindre un fichier avant de confirmer.");
      return;
    }

    setLivrableUploading(true);
    setLivrableError("");
    try {
      const { url, publicId } = await uploadDirectToCloudinary(livrableFile, "auto");

      await repondreDemande(livrableModal.id, "terminee", null, {
        livrable_url: url,
        livrable_public_id: publicId,
        livrable_nom_fichier: livrableFile.name,
        livrable_message: livrableMessage || null,
      });

      setDemandes((prev) =>
        prev.map((d) =>
          d.id === livrableModal.id
            ? {
                ...d,
                statut: "terminee",
                livrable_url: url,
                livrable_nom_fichier: livrableFile.name,
                livrable_message: livrableMessage || null,
              }
            : d
        )
      );
      setLivrableModal(null);
      setLivrableFile(null);
      setLivrableMessage("");
    } catch (err) {
      setLivrableError(
        err.response?.data?.message || "Impossible d'envoyer le livrable. Réessayez."
      );
    } finally {
      setLivrableUploading(false);
    }
  };

  const ouvrirRefus = (demande) => {
    setMotifModal(demande);
    setMotif("");
  };

  const confirmerRefus = async () => {
    if (!motifModal) return;
    setConfirmingRefus(true);
    setError("");
    try {
      await repondreDemande(motifModal.id, "refusee", motif || null);
      setDemandes((prev) =>
        prev.map((d) => (d.id === motifModal.id ? { ...d, statut: "refusee" } : d))
      );
      setMotifModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de refuser cette demande.");
    } finally {
      setConfirmingRefus(false);
    }
  };

  const counts = demandes
    ? {
        toutes: demandes.length,
        en_attente: demandes.filter((d) => d.statut === "en_attente").length,
        acceptee: demandes.filter((d) => d.statut === "acceptee").length,
        refusee: demandes.filter((d) => d.statut === "refusee").length,
        terminee: demandes.filter((d) => d.statut === "terminee").length,
      }
    : { toutes: 0, en_attente: 0, acceptee: 0, refusee: 0, terminee: 0 };

  const filtered = demandes
    ? filter === "toutes"
      ? demandes
      : demandes.filter((d) => d.statut === filter)
    : null;

  const filterLabel = FILTERS.find((f) => f.key === filter)?.label;

  return (
    <div className="td-root">
      <TalentTopNav activeKey="demandes" />

      <main className="td-main">
        <div className="td-page">
          <div className="td-page-header td-anim-in">
            <div>
              <h1 className="td-page-title">Demandes reçues</h1>
              <p className="td-page-sub">Acceptez ou refusez les demandes de prestation des clients.</p>
            </div>
          </div>

          {demandes !== null && demandes.length > 0 && (
            <div className="dr-summary-grid td-anim-in td-anim-delay-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`dr-summary-card ${f.cardCls} ${filter === f.key ? "dr-summary-card-active" : ""}`}
                >
                  <div className="dr-summary-val">{counts[f.key]}</div>
                  <div className="dr-summary-label">{f.label}</div>
                </button>
              ))}
            </div>
          )}

          {error && <p className="profil-creer-error">{error}</p>}

          {filtered === null ? (
            <div className="dr-loading">
              <Loader2 size={20} className="dr-loading-spin" />
              <span>Chargement de vos demandes...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dr-empty td-anim-in td-anim-delay-2">
              <div className="dr-empty-icon-wrap">
                <Clock size={26} />
              </div>
              <p className="dr-empty-title">
                {filter === "toutes" ? "Aucune demande reçue pour le moment" : "Aucune demande dans cette catégorie"}
              </p>
              <p className="dr-empty-sub">
                Les nouvelles demandes de clients apparaîtront ici dès qu'elles arrivent.
              </p>
            </div>
          ) : (
            <>
              {filter !== "toutes" && (
                <p className="dr-list-count">
                  {filtered.length} demande{filtered.length > 1 ? "s" : ""} {filterLabel?.toLowerCase()}
                </p>
              )}

              <div className="dr-list">
                {filtered.map((d, i) => {
                  const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente;
                  const StatusIcon = config.icon;
                  const enAttente = d.statut === "en_attente";
                  const acceptee = d.statut === "acceptee";
                  const terminee = d.statut === "terminee";

                  return (
                    <div key={d.id} className="dr-card td-anim-in" style={{ animationDelay: `${60 * i}ms` }}>
                      <div className="dr-card-top">
                        <div className="dr-client-row">
                          <div className="dr-client-avatar">{d.client_nom?.[0] ?? "?"}</div>
                          <p className="dr-client-name">{d.client_nom}</p>
                        </div>
                        <span className={`dr-badge ${config.cls}`}>
                          <StatusIcon size={12} /> {config.label}
                        </span>
                      </div>

                      <div className="dr-meta-row">
                        {d.date_souhaitee && (
                          <span className="dr-meta-item">
                            <Calendar size={11} />
                            {new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {d.budget && (
                          <span className="dr-meta-budget">
                            <Wallet size={11} /> {Number(d.budget).toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>

                      <p className="dr-message">"{d.message_initial}"</p>

                      {enAttente && (
                        <div className="dr-actions">
                          <button onClick={() => handleAccepter(d.id)} disabled={respondingId === d.id} className="dr-accept-btn">
                            {respondingId === d.id ? <Loader2 size={14} className="dr-loading-spin" /> : <CheckCircle size={14} />}
                            Accepter
                          </button>
                          <button onClick={() => ouvrirRefus(d)} disabled={respondingId === d.id} className="dr-reject-btn">
                            <XCircle size={14} /> Refuser
                          </button>
                        </div>
                      )}

                      {acceptee && (
                        <div className="dr-actions">
                          <button onClick={() => ouvrirLivrableModal(d)} className="dr-terminer-btn">
                            <CheckCircle size={14} />
                            Marquer comme terminée
                          </button>
                        </div>
                      )}

                      {terminee && d.livrable_url && (
                        <div className="dr-actions">
                          <a href={d.livrable_url} target="_blank" rel="noopener noreferrer" className="dr-terminer-btn">
                            <Paperclip size={14} />
                            Voir le livrable envoyé
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {motifModal && (
        <div className="dr-modal-overlay" onClick={closeMotifModal}>
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <h2 className="dr-modal-title">Refuser la demande de {motifModal.client_nom}</h2>
              <button className="dr-modal-close" onClick={closeMotifModal} disabled={confirmingRefus} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <textarea
              rows={3}
              maxLength={MOTIF_MAX_LENGTH}
              placeholder="Motif du refus (facultatif)..."
              className="dr-modal-textarea"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              disabled={confirmingRefus}
            />
            <p className="dr-modal-char-count">{motif.length}/{MOTIF_MAX_LENGTH}</p>

            <div className="dr-modal-actions">
              <button onClick={closeMotifModal} className="dr-modal-cancel" disabled={confirmingRefus}>
                Annuler
              </button>
              <button onClick={confirmerRefus} className="dr-modal-confirm" disabled={confirmingRefus}>
                {confirmingRefus ? <Loader2 size={14} className="dr-loading-spin" /> : null}
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {livrableModal && (
        <div className="dr-modal-overlay" onClick={closeLivrableModal}>
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dr-modal-header">
              <h2 className="dr-modal-title">Livrable pour {livrableModal.client_nom}</h2>
              <button className="dr-modal-close" onClick={closeLivrableModal} disabled={livrableUploading} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>

            <p className="dr-modal-char-count" style={{ marginBottom: 8 }}>
              Joignez le résultat de la prestation (photo, PDF, vidéo, fichier ZIP...).
            </p>

            <input
              type="file"
              id="livrable-file-input"
              accept="image/*,application/pdf,video/*,.zip,application/zip,application/x-zip-compressed"
              onChange={(e) => setLivrableFile(e.target.files?.[0] || null)}
              disabled={livrableUploading}
              style={{ display: "none" }}
            />
            <label
              htmlFor="livrable-file-input"
              className="dr-modal-cancel"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: livrableUploading ? "not-allowed" : "pointer",
                opacity: livrableUploading ? 0.6 : 1,
                width: "fit-content",
              }}
            >
              <Paperclip size={14} />
              Choisir un fichier
            </label>
            {livrableFile && (
              <p className="dr-modal-char-count" style={{ marginTop: 6 }}>
                Fichier sélectionné : {livrableFile.name}
              </p>
            )}

            <textarea
              rows={3}
              maxLength={LIVRABLE_MESSAGE_MAX_LENGTH}
              placeholder="Message pour le client (facultatif)..."
              className="dr-modal-textarea"
              value={livrableMessage}
              onChange={(e) => setLivrableMessage(e.target.value)}
              disabled={livrableUploading}
              style={{ marginTop: 12 }}
            />
            <p className="dr-modal-char-count">{livrableMessage.length}/{LIVRABLE_MESSAGE_MAX_LENGTH}</p>

            {livrableError && <p className="profil-creer-error">{livrableError}</p>}

            <div className="dr-modal-actions">
              <button onClick={closeLivrableModal} className="dr-modal-cancel" disabled={livrableUploading}>
                Annuler
              </button>
              <button onClick={confirmerLivrable} className="dr-modal-confirm" disabled={livrableUploading}>
                {livrableUploading ? <Loader2 size={14} className="dr-loading-spin" /> : null}
                Confirmer et terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}