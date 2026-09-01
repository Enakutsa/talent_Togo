import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Search,
  X,
  Star,
  Send,
  Paperclip,
} from "lucide-react";

import {
  getMesDemandes,
  annulerDemande,
} from "../../services/demande.service";

import {
  envoyerAvis,
  getMesAvis,
} from "../../services/avis.service";

import ClientTopNav from "../../components/ClientTopNav";

import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/DemandesEnvoyees.css";

const STATUT_CONFIG = {
  en_attente: {
    label: "En attente",
    cls: "de-badge-pending",
    icon: Clock,
  },
  acceptee: {
    label: "Acceptée",
    cls: "de-badge-accepted",
    icon: CheckCircle,
  },
  refusee: {
    label: "Refusée",
    cls: "de-badge-rejected",
    icon: XCircle,
  },
  terminee: {
    label: "Terminée",
    cls: "de-badge-terminee",
    icon: CheckCircle,
  },
};

const FILTERS = [
  {
    key: null,
    label: "Total",
    cardCls: "de-summary-total",
  },
  {
    key: "en_attente",
    label: "En attente",
    cardCls: "de-summary-pending",
  },
  {
    key: "acceptee",
    label: "Acceptées",
    cardCls: "de-summary-accepted",
  },
  {
    key: "refusee",
    label: "Refusées",
    cardCls: "de-summary-rejected",
  },
  {
    key: "terminee",
    label: "Terminées",
    cardCls: "de-summary-terminee",
  },
];

export default function DemandesEnvoyees() {
  const navigate = useNavigate();

  const [demandes, setDemandes] = useState(null);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const [counts, setCounts] = useState({
    all: 0,
    en_attente: 0,
    acceptee: 0,
    refusee: 0,
    terminee: 0,
  });

  const [statutFilter, setStatutFilter] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const [avisIds, setAvisIds] = useState([]);

  const [avisModal, setAvisModal] = useState(null);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [sendingAvis, setSendingAvis] = useState(false);
  const [avisError, setAvisError] = useState("");

  // Charger les demandes
  useEffect(() => {
    setDemandes(null);
    setError("");

    getMesDemandes(page, statutFilter)
      .then((res) => {
        setDemandes(res.data || []);
        setMeta(res.meta || null);

        if (res.counts) {
          setCounts(res.counts);
        }
      })
      .catch(() => {
        setError("Impossible de charger vos demandes.");
        setDemandes([]);
      });
  }, [page, statutFilter]);

  // Charger les avis déjà envoyés
  useEffect(() => {
    getMesAvis()
      .then((res) => {
        setAvisIds(
          (res.data || []).map(
            (a) => a.demande_prestation_id
          )
        );
      })
      .catch(() => {});
  }, []);

  // Filtre
  const handleFilterClick = (key) => {
    if (key === statutFilter) return;

    setStatutFilter(key);
    setPage(1);
  };

  // Annuler une demande
  const handleAnnuler = async (id) => {
    if (!window.confirm("Annuler cette demande ?")) {
      return;
    }

    setCancellingId(id);
    setError("");

    try {
      await annulerDemande(id);

      setDemandes((prev) =>
        prev ? prev.filter((d) => d.id !== id) : []
      );

      setCounts((prev) => ({
        ...prev,
        all: Math.max(0, prev.all - 1),
        en_attente: Math.max(
          0,
          prev.en_attente - 1
        ),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible d'annuler cette demande."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Ouvrir le modal d'avis
  const ouvrirAvis = (demande) => {
    setAvisModal(demande);
    setNote(0);
    setCommentaire("");
    setAvisError("");
  };

  // Fermer le modal
  const fermerAvis = () => {
    setAvisModal(null);
    setNote(0);
    setCommentaire("");
    setAvisError("");
  };

  // Envoyer un avis
  const handleEnvoyerAvis = async () => {
    if (note === 0) {
      setAvisError("Sélectionnez une note.");
      return;
    }

    if (!avisModal) {
      return;
    }

    setAvisError("");
    setSendingAvis(true);

    try {
      await envoyerAvis({
        demande_prestation_id: avisModal.id,
        note,
        commentaire: commentaire || null,
      });

      setAvisIds((prev) => [
        ...prev,
        avisModal.id,
      ]);

      fermerAvis();
    } catch (err) {
      setAvisError(
        err.response?.data?.message ||
          "Impossible d'envoyer l'avis."
      );
    } finally {
      setSendingAvis(false);
    }
  };

  // Nombre pour les cartes
  const countValue = (key) => {
    if (key === null) {
      return counts.all ?? 0;
    }

    return counts[key] ?? 0;
  };

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="demandes" />

      <main className="cd-main">
        <div className="cd-page cd-page-narrow">

          {/* HEADER */}
          <div className="de-header">
            <div>
              <h1 className="cd-page-title">
                Mes demandes
              </h1>

              <p className="cd-page-sub">
                Suivez l'état de vos demandes de prestation.
              </p>
            </div>

            <button
              onClick={() => navigate("/recherche")}
              className="de-new-btn"
            >
              <Search size={16} />
              Nouvelle demande
            </button>
          </div>

          {/* ERREUR */}
          {error && (
            <p className="cd-error">
              {error}
            </p>
          )}

          {/* FILTRES */}
          {counts.all > 0 && (
            <div className="de-summary-grid">
              {FILTERS.map((f) => (
                <button
                  key={String(f.key)}
                  onClick={() =>
                    handleFilterClick(f.key)
                  }
                  className={`de-summary-card ${
                    f.cardCls
                  } ${
                    statutFilter === f.key
                      ? "de-summary-card-active"
                      : ""
                  }`}
                >
                  <div className="de-summary-val">
                    {countValue(f.key)}
                  </div>

                  <div className="de-summary-label">
                    {f.label}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CHARGEMENT / LISTE VIDE / LISTE */}
          {demandes === null ? (
            <p className="text-gray-500 text-sm">
              Chargement...
            </p>
          ) : demandes.length === 0 ? (
            statutFilter === null ? (
              <div className="de-empty">
                <div className="de-empty-icon">
                  <MessageSquare size={28} />
                </div>

                <h3 className="de-empty-title">
                  Aucune demande envoyée
                </h3>

                <p className="de-empty-sub">
                  Contactez un talent depuis son profil
                  pour envoyer votre première demande.
                </p>

                <button
                  onClick={() =>
                    navigate("/recherche")
                  }
                  className="de-explore-btn"
                >
                  Explorer les talents
                </button>
              </div>
            ) : (
              <div className="de-empty">
                <div className="de-empty-icon">
                  <MessageSquare size={28} />
                </div>

                <h3 className="de-empty-title">
                  Aucune demande dans cette catégorie
                </h3>
              </div>
            )
          ) : (
            <>
              {/* LISTE DES DEMANDES */}
              <div className="de-list">
                {demandes.map((d) => {
                  const config =
                    STATUT_CONFIG[d.statut] ||
                    STATUT_CONFIG.en_attente;

                  const StatusIcon = config.icon;

                  const peutAnnuler =
                    d.statut === "en_attente";

                  const peutNoter =
                    d.statut === "terminee" &&
                    !avisIds.includes(d.id);

                  const aLivrable =
                    d.statut === "terminee" &&
                    !!d.livrable_url;

                  return (
                    <div
                      key={d.id}
                      className="de-card"
                    >
                      {/* TOP CARD */}
                      <div className="de-card-top">
                        <div>
                          <button
                            onClick={() =>
                              navigate(
                                `/talents/${d.talent_id}`
                              )
                            }
                            className="de-talent-name"
                          >
                            {d.talent_nom}
                          </button>

                          <span className="de-category-tag">
                            {d.categorie}
                          </span>
                        </div>

                        <span
                          className={`de-badge ${config.cls}`}
                        >
                          <StatusIcon size={12} />
                          {config.label}
                        </span>
                      </div>

                      {/* META */}
                      <div className="de-meta-row">
                        {d.date_souhaitee && (
                          <span className="de-meta-item">
                            <Clock size={11} />

                            {new Date(
                              d.date_souhaitee
                            ).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        )}

                        {d.budget && (
                          <span className="de-meta-budget">
                            {Number(
                              d.budget
                            ).toLocaleString(
                              "fr-FR"
                            )}{" "}
                            FCFA
                          </span>
                        )}
                      </div>

                      {/* MESSAGE */}
                      <div className="de-message-thread">
                        <div className="de-message-bar" />

                        <p className="de-message-text">
                          "{d.message_initial}"
                        </p>
                      </div>

                      {/* ACTIONS */}
                      <div className="de-actions">

                        {/* MESSAGE */}
                        <button
                          onClick={() =>
                            navigate(
                              "/client/messages"
                            )
                          }
                          className="de-message-btn"
                        >
                          <MessageSquare size={12} />
                          Message
                        </button>

                        {/* LIVRABLE */}
                        {aLivrable && (
                          <a
                            href={d.livrable_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="de-avis-btn"
                          >
                            <Paperclip size={12} />
                            Voir le livrable
                          </a>
                        )}

                        {/* AVIS */}
                        {peutNoter && (
                          <button
                            onClick={() =>
                              ouvrirAvis(d)
                            }
                            className="de-avis-btn"
                          >
                            <Star size={12} />
                            Laisser un avis
                          </button>
                        )}

                        {/* ANNULER */}
                        {peutAnnuler && (
                          <button
                            onClick={() =>
                              handleAnnuler(d.id)
                            }
                            disabled={
                              cancellingId === d.id
                            }
                            className="de-cancel-btn"
                          >
                            <X size={12} />

                            {cancellingId === d.id
                              ? "Annulation..."
                              : "Annuler"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {meta && meta.last_page > 1 && (
                <div className="de-pagination">
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.max(1, p - 1)
                      )
                    }
                    disabled={page === 1}
                    className="de-page-btn"
                  >
                    Précédent
                  </button>

                  <span className="de-page-info">
                    Page {meta.current_page} sur{" "}
                    {meta.last_page}
                  </span>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(
                          meta.last_page,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      page === meta.last_page
                    }
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

      {/* MODAL AVIS */}
      {avisModal && (
        <div
          className="de-avis-modal-overlay"
          onClick={fermerAvis}
        >
          <div
            className="de-avis-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h2 className="de-avis-modal-title">
              Noter {avisModal.talent_nom}
            </h2>

            {/* ERREUR AVIS */}
            {avisError && (
              <p className="cd-error">
                {avisError}
              </p>
            )}

            {/* ÉTOILES */}
            <div className="de-avis-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNote(n)}
                  className="de-avis-star-btn"
                  aria-label={`Donner ${n} étoile${
                    n > 1 ? "s" : ""
                  }`}
                >
                  <Star
                    size={28}
                    className={
                      n <= note
                        ? "de-avis-star-filled"
                        : "de-avis-star-empty"
                    }
                  />
                </button>
              ))}
            </div>

            {/* COMMENTAIRE */}
            <textarea
              rows={4}
              placeholder="Partagez votre expérience (facultatif)..."
              className="de-avis-textarea"
              value={commentaire}
              onChange={(e) =>
                setCommentaire(e.target.value)
              }
            />

            {/* ACTIONS MODAL */}
            <div className="de-avis-modal-actions">
              <button
                onClick={fermerAvis}
                className="de-modal-cancel"
              >
                Annuler
              </button>

              <button
                onClick={handleEnvoyerAvis}
                disabled={
                  sendingAvis || note === 0
                }
                className="de-modal-send"
              >
                {sendingAvis ? (
                  "Envoi..."
                ) : (
                  <>
                    <Send size={14} />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}