import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Calendar, Wallet } from "lucide-react";
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

export default function DemandesRecues() {
  const [demandes, setDemandes] = useState(null);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [motifModal, setMotifModal] = useState(null);
  const [motif, setMotif] = useState("");
  const [filter, setFilter] = useState("toutes");

  useEffect(() => {
    getDemandesRecues()
      .then((res) => setDemandes(res.data || []))
      .catch(() => setError("Impossible de charger vos demandes."));
  }, []);

  const handleAccepter = async (id) => {
    setRespondingId(id);
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
    setRespondingId(motifModal.id);
    try {
      await repondreDemande(motifModal.id, "refusee", motif || null);
      setDemandes((prev) =>
        prev.map((d) => (d.id === motifModal.id ? { ...d, statut: "refusee" } : d))
      );
      setMotifModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de refuser cette demande.");
    } finally {
      setRespondingId(null);
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
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : filtered.length === 0 ? (
            <div className="dr-empty">
              <Clock size={32} />
              <p className="dr-empty-title">
                {filter === "toutes" ? "Aucune demande reçue pour le moment" : "Aucune demande dans cette catégorie"}
              </p>
            </div>
          ) : (
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
                          <CheckCircle size={14} /> Accepter
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
                          <CheckCircle size={14} /> Marquer comme terminée
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {motifModal && (
        <div className="dr-modal-overlay" onClick={() => setMotifModal(null)}>
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="dr-modal-title">Refuser la demande de {motifModal.client_nom}</h2>
            <textarea
              rows={3}
              placeholder="Motif du refus (facultatif)..."
              className="dr-modal-textarea"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
            <div className="dr-modal-actions">
              <button onClick={() => setMotifModal(null)} className="dr-modal-cancel">Annuler</button>
              <button onClick={confirmerRefus} className="dr-modal-confirm">Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}