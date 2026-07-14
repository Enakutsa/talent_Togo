import { useState, useEffect } from "react";
import {
  Clock, CheckCircle, XCircle, MessageSquare, Loader2, Inbox,
} from "lucide-react";
import TalentTopNav from "../../components/TalentTopNav";
import Footer from "../../components/Footer";
import { getDemandesRecues, repondreDemande } from "../../services/demande.service";
import "../../assets/styles/DemandesRecues.css";

const STATUT_MAP = {
  en_attente: { label: "En attente", cls: "dr-badge-attente", icon: Clock },
  acceptee:   { label: "Acceptée",   cls: "dr-badge-acceptee", icon: CheckCircle },
  refusee:    { label: "Refusée",    cls: "dr-badge-refusee",  icon: XCircle },
  terminee:   { label: "Terminée",   cls: "dr-badge-terminee", icon: CheckCircle },
};

const FILTERS = [
  { key: "toutes",     label: "Toutes" },
  { key: "en_attente", label: "En attente" },
  { key: "acceptee",   label: "Acceptées" },
  { key: "refusee",    label: "Refusées" },
  { key: "terminee",   label: "Terminées" },
];

export default function DemandesRecues() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("toutes");
  const [expanded, setExpanded] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    chargerDemandes();
  }, []);

  const chargerDemandes = () => {
    setLoading(true);
    setError("");
    getDemandesRecues()
      .then((res) => setDemandes(res.data || []))
      .catch(() => setError("Impossible de charger les demandes. Réessayez plus tard."))
      .finally(() => setLoading(false));
  };

  const handleRepondre = (id, statut) => {
    setActionLoadingId(id);
    repondreDemande(id, statut)
      .then((res) => {
        setDemandes((prev) => prev.map((d) => (d.id === id ? res.data : d)));
        setExpanded(null);
      })
      .catch((err) => {
        const message = err?.response?.data?.message || "Une erreur est survenue.";
        setError(message);
      })
      .finally(() => setActionLoadingId(null));
  };

  const filtered = filter === "toutes"
    ? demandes
    : demandes.filter((d) => d.statut === filter);

  const nbEnAttente = demandes.filter((d) => d.statut === "en_attente").length;

  return (
    <div className="dr-page">
      <TalentTopNav activeKey="demandes" />

      <div className="dr-body">
        <div className="dr-header">
          <div>
            <h1 className="dr-title">Demandes reçues</h1>
            <p className="dr-sub">
              {nbEnAttente > 0
                ? `${nbEnAttente} demande${nbEnAttente > 1 ? "s" : ""} en attente de réponse`
                : "Aucune demande en attente"}
            </p>
          </div>
        </div>

        <div className="dr-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`dr-filter-btn ${filter === f.key ? "dr-filter-btn-active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <p className="dr-error">{error}</p>}

        {loading ? (
          <div className="dr-loading">
            <Loader2 size={22} className="dr-spin" />
            <span>Chargement des demandes...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dr-empty">
            <Inbox size={32} className="dr-empty-icon" />
            <p>Aucune demande {filter !== "toutes" ? "dans cette catégorie" : "pour le moment"}.</p>
          </div>
        ) : (
          <div className="dr-list">
            {filtered.map((d) => {
              const statutInfo = STATUT_MAP[d.statut] || STATUT_MAP.en_attente;
              const StatutIcon = statutInfo.icon;
              const isExpanded = expanded === d.id;
              const isLoadingAction = actionLoadingId === d.id;

              return (
                <div key={d.id} className="dr-card">
                  <div
                    className="dr-card-top"
                    onClick={() => setExpanded(isExpanded ? null : d.id)}
                  >
                    <div className="dr-card-info">
                      <div className="dr-card-row">
                        <p className="dr-client-name">{d.client_nom}</p>
                        <span className={`dr-badge ${statutInfo.cls}`}>
                          <StatutIcon size={12} /> {statutInfo.label}
                        </span>
                      </div>
                      <div className="dr-card-meta">
                        {d.date_souhaitee && (
                          <span className="dr-meta-item">
                            <Clock size={12} /> {new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {d.budget && (
                          <span className="dr-meta-budget">
                            {Number(d.budget).toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="dr-card-details">
                      <p className="dr-details-label">Message du client :</p>
                      <div className="dr-message-box">
                        <MessageSquare size={16} className="dr-message-icon" />
                        <p className="dr-message-text">{d.message_initial}</p>
                      </div>

                      {d.statut === "en_attente" && (
                        <div className="dr-actions">
                          <button
                            className="dr-btn dr-btn-accept"
                            disabled={isLoadingAction}
                            onClick={() => handleRepondre(d.id, "acceptee")}
                          >
                            {isLoadingAction ? <Loader2 size={15} className="dr-spin" /> : <CheckCircle size={15} />}
                            Accepter
                          </button>
                          <button
                            className="dr-btn dr-btn-refuse"
                            disabled={isLoadingAction}
                            onClick={() => handleRepondre(d.id, "refusee")}
                          >
                            {isLoadingAction ? <Loader2 size={15} className="dr-spin" /> : <XCircle size={15} />}
                            Refuser
                          </button>
                        </div>
                      )}

                      {d.statut === "acceptee" && (
                        <div className="dr-actions">
                          <button
                            className="dr-btn dr-btn-terminer"
                            disabled={isLoadingAction}
                            onClick={() => handleRepondre(d.id, "terminee")}
                          >
                            {isLoadingAction ? <Loader2 size={15} className="dr-spin" /> : <CheckCircle size={15} />}
                            Marquer comme terminée
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}