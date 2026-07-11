import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, MessageSquare, Search, X } from "lucide-react";
import { getMesDemandes, annulerDemande } from "../../services/demande.service";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/DemandesEnvoyees.css";

const STATUT_CONFIG = {
  en_attente: { label: "En attente", cls: "de-badge-pending", icon: Clock },
  acceptee: { label: "Acceptée", cls: "de-badge-accepted", icon: CheckCircle },
  refusee: { label: "Refusée", cls: "de-badge-rejected", icon: XCircle },
};

export default function DemandesEnvoyees() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    setDemandes(null); // affiche "Chargement..." à chaque changement de page
    getMesDemandes(page)
      .then((res) => {
        setDemandes(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError("Impossible de charger vos demandes."));
  }, [page]);

  const handleAnnuler = async (id) => {
    if (!window.confirm("Annuler cette demande ?")) return;

    setCancellingId(id);
    try {
      await annulerDemande(id);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'annuler cette demande.");
    } finally {
      setCancellingId(null);
    }
  };

  const counts = demandes
    ? {
        all: meta?.total ?? demandes.length,
        en_attente: demandes.filter((d) => d.statut === "en_attente").length,
        acceptee: demandes.filter((d) => d.statut === "acceptee").length,
        refusee: demandes.filter((d) => d.statut === "refusee").length,
      }
    : { all: 0, en_attente: 0, acceptee: 0, refusee: 0 };

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="demandes" />

      <main className="cd-main">
        <div className="cd-page cd-page-narrow">

          <div className="de-header">
            <div>
              <h1 className="cd-page-title">Mes demandes</h1>
              <p className="cd-page-sub">Suivez l'état de vos demandes de prestation.</p>
            </div>
            <button onClick={() => navigate("/recherche")} className="de-new-btn">
              <Search size={16} /> Nouvelle demande
            </button>
          </div>

          {error && <p className="cd-error">{error}</p>}

          {demandes === null ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : demandes.length === 0 && page === 1 ? (
            <div className="de-empty">
              <div className="de-empty-icon">
                <MessageSquare size={28} />
              </div>
              <h3 className="de-empty-title">Aucune demande envoyée</h3>
              <p className="de-empty-sub">
                Contactez un talent depuis son profil pour envoyer votre première demande.
              </p>
              <button onClick={() => navigate("/recherche")} className="de-explore-btn">
                Explorer les talents
              </button>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="de-summary-grid">
                <div className="de-summary-card de-summary-total">
                  <div className="de-summary-val">{counts.all}</div>
                  <div className="de-summary-label">Total</div>
                </div>
                <div className="de-summary-card de-summary-pending">
                  <div className="de-summary-val">{counts.en_attente}</div>
                  <div className="de-summary-label">En attente</div>
                </div>
                <div className="de-summary-card de-summary-accepted">
                  <div className="de-summary-val">{counts.acceptee}</div>
                  <div className="de-summary-label">Acceptées</div>
                </div>
                <div className="de-summary-card de-summary-rejected">
                  <div className="de-summary-val">{counts.refusee}</div>
                  <div className="de-summary-label">Refusées</div>
                </div>
              </div>

              {/* Liste */}
              <div className="de-list">
                {demandes.map((d) => {
                  const config = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente;
                  const StatusIcon = config.icon;
                  const peutAnnuler = d.statut === "en_attente";

                  return (
                    <div key={d.id} className="de-card">
                      <div className="de-card-top">
                        <div>
                          <button
                            onClick={() => navigate(`/talents/${d.talent_id}`)}
                            className="de-talent-name"
                          >
                            {d.talent_nom}
                          </button>
                          <span className="de-category-tag">{d.categorie}</span>
                        </div>
                        <span className={`de-badge ${config.cls}`}>
                          <StatusIcon size={12} /> {config.label}
                        </span>
                      </div>

                      <div className="de-meta-row">
                        {d.date_souhaitee && (
                          <span className="de-meta-item">
                            <Clock size={11} />
                            {new Date(d.date_souhaitee).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                        {d.budget && (
                          <span className="de-meta-budget">
                            {Number(d.budget).toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>

                      <div className="de-message-thread">
                        <div className="de-message-bar" />
                        <p className="de-message-text">"{d.message_initial}"</p>
                      </div>

                      <div className="de-actions">
                        <button
                          onClick={() => navigate("/client/messages")}
                          className="de-message-btn"
                        >
                          <MessageSquare size={12} /> Message
                        </button>

                        {peutAnnuler && (
                          <button
                            onClick={() => handleAnnuler(d.id)}
                            disabled={cancellingId === d.id}
                            className="de-cancel-btn"
                          >
                            <X size={12} /> {cancellingId === d.id ? "Annulation..." : "Annuler"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="de-pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="de-page-btn"
                  >
                    Précédent
                  </button>

                  <span className="de-page-info">
                    Page {meta.current_page} sur {meta.last_page}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    className="de-page-btn"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
}