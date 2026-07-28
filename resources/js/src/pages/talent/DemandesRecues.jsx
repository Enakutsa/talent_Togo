import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, Calendar, Wallet, X, Loader2 } from "lucide-react";
import { getDemandesRecues, repondreDemande } from "../../services/demande.service";
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
  { key: "toutes",     label: "Total",      cardCls: "dr-summary-total" },
  { key: "en_attente", label: "En attente", cardCls: "dr-summary-pending" },
  { key: "acceptee",   label: "Acceptées",  cardCls: "dr-summary-accepted" },
  { key: "refusee",    label: "Refusées",   cardCls: "dr-summary-rejected" },
  { key: "terminee",   label: "Terminées",  cardCls: "dr-summary-terminee" },
];

const MOTIF_MAX_LENGTH = 300;

export default function DemandesRecues() {
  const [demandes, setDemandes] = useState(null);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [motifModal, setMotifModal] = useState(null);
  const [motif, setMotif] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [confirmingRefus, setConfirmingRefus] = useState(false);

  useEffect(() => {
    getDemandesRecues()
      .then((res) => setDemandes(res.data || []))
      .catch(() => setError("Impossible de charger vos demandes."));
  }, []);

  // Ferme la modale de refus avec la touche Échap
  const closeMotifModal = useCallback(() => {
    if (confirmingRefus) return; // évite de fermer pendant l'envoi
    setMotifModal(null);
  }, [confirmingRefus]);

  useEffect(() => {
    if (!motifModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMotifModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [motifModal, closeMotifModal]);

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

  const handleTerminer = async (id) => {
    setRespondingId(id);
    setError("");
    try {
      await repondreDemande(id, "terminee");
      setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "terminee" } : d)));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de marquer cette demande comme terminée.");
    } finally {
      setRespondingId(null);
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
          <div className="td-page-header">
            <div>
              <h1 className="td-page-title">Demandes reçues</h1>
              <p className="td-page-sub">Acceptez ou refusez les demandes de prestation des clients.</p>
            </div>
          </div>

          {demandes !== null && demandes.length > 0 && (
            <div className="dr-summary-grid">
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
            <div className="dr-empty">
              <Clock size={32} />
              <p className="dr-empty-title">
                {filter === "toutes" ? "Aucune demande reçue pour le moment" : "Aucune demande dans cette catégorie"}
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
                {filtered.map((d) => {
                  const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente;
                  const StatusIcon = config.icon;
                  const enAttente = d.statut === "en_attente";
                  const acceptee = d.statut === "acceptee";

                  return (
                    <div key={d.id} className="dr-card">
                      <div className="dr-card-top">
                        <p className="dr-client-name">{d.client_nom}</p>
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
                          <button
                            onClick={() => handleAccepter(d.id)}
                            disabled={respondingId === d.id}
                            className="dr-accept-btn"
                          >
                            {respondingId === d.id ? (
                              <Loader2 size={14} className="dr-loading-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Accepter
                          </button>
                          <button
                            onClick={() => ouvrirRefus(d)}
                            disabled={respondingId === d.id}
                            className="dr-reject-btn"
                          >
                            <XCircle size={14} /> Refuser
                          </button>
                        </div>
                      )}

                      {acceptee && (
                        <div className="dr-actions">
                          <button
                            onClick={() => handleTerminer(d.id)}
                            disabled={respondingId === d.id}
                            className="dr-terminer-btn"
                          >
                            {respondingId === d.id ? (
                              <Loader2 size={14} className="dr-loading-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Marquer comme terminée
                          </button>
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
              <button
                className="dr-modal-close"
                onClick={closeMotifModal}
                disabled={confirmingRefus}
                aria-label="Fermer"
              >
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
    </div>
  );
}