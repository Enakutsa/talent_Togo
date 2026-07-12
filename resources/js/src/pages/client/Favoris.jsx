import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Star, MessageSquare, Trash2, Search, User } from "lucide-react";
import { getFavoris, toggleFavori } from "../../services/favori.service";
import ClientTopNav from "../../components/ClientTopNav";
import "../../assets/styles/ClientDashboard.css";
import "../../assets/styles/Favoris.css";

export default function Favoris() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState(null);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    setFavs(null); // affiche "Chargement..." à chaque changement de page
    getFavoris(page)
      .then((res) => {
        setFavs(res.data || []);
        setMeta(res.meta || null);
      })
      .catch(() => setError("Impossible de charger vos favoris."));
  }, [page]);

  const remove = async (talentId) => {
    setRemovingId(talentId);
    try {
      await toggleFavori(talentId);
      setFavs((prev) => prev.filter((f) => f.talent_id !== talentId));
      setMeta((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
    } catch {
      setError("Impossible de retirer ce favori.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="cd-root">
      <ClientTopNav activeKey="favoris" />

      <main className="cd-main">
        <div className="cd-page cd-page-narrow">

          <div className="cd-fav-header">
            <div>
              <h1 className="cd-page-title">Mes favoris</h1>
              <p className="cd-page-sub">
                {meta ? `${meta.total} talent${meta.total !== 1 ? "s" : ""} sauvegardé${meta.total !== 1 ? "s" : ""}` : "Chargement..."}
              </p>
            </div>
            <div className="cd-fav-header-icon">
              <Heart size={22} className="cd-fav-header-heart" />
            </div>
          </div>

          {error && <p className="cd-error">{error}</p>}

          {favs === null ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : favs.length === 0 && page === 1 ? (
            <div className="cd-fav-empty">
              <div className="cd-fav-empty-icon">
                <Heart size={28} />
              </div>
              <h3 className="cd-fav-empty-title">Aucun favori</h3>
              <p className="cd-fav-empty-sub">Ajoutez des talents à vos favoris pour les retrouver facilement.</p>
              <button onClick={() => navigate("/recherche")} className="cd-fav-explore-btn">
                <Search size={16} /> Explorer les talents
              </button>
            </div>
          ) : (
            <>
              <div className="cd-fav-list">
                {favs.map((t) => (
                  <div key={t.favori_id} className="cd-fav-row">
                    <div className="cd-fav-avatar-wrap" onClick={() => navigate(`/talents/${t.talent_id}`)}>
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.nom} className="cd-fav-avatar" />
                      ) : (
                        <div className="cd-fav-avatar-placeholder"><User size={22} /></div>
                      )}
                    </div>

                    <div className="cd-fav-info">
                      <div className="cd-fav-info-top">
                        <div>
                          <button
                            onClick={() => navigate(`/talents/${t.talent_id}`)}
                            className="cd-fav-name"
                          >
                            {t.nom}
                          </button>
                          <span className="cd-fav-category-tag">{t.categorie}</span>
                        </div>
                        <span className={`cd-fav-dispo-text ${t.disponible ? "on" : "off"}`}>
                          ● {t.disponible ? "Disponible" : "Indisponible"}
                        </span>
                      </div>

                      <div className="cd-fav-meta-row">
                        <div className="cd-fav-meta-item">
                          <MapPin size={11} /> {t.ville}
                        </div>
                        <div className="cd-fav-meta-item">
                          <Star size={11} className="cd-fav-star" />
                          <span className="cd-fav-note">{t.note}</span>
                          <span className="cd-fav-avis-count">({t.avis})</span>
                        </div>
                        <span className="cd-fav-price">{Number(t.tarif).toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    </div>

                    <div className="cd-fav-actions">
                      <button
                        onClick={() => navigate(`/talents/${t.talent_id}`)}
                        className="cd-fav-contact-btn"
                      >
                        <MessageSquare size={13} /> Contacter
                      </button>
                      <button
                        onClick={() => remove(t.talent_id)}
                        className="cd-fav-remove-btn"
                        disabled={removingId === t.talent_id}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {meta && meta.last_page > 1 && (
                <div className="cd-fav-pagination">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cd-fav-page-btn"
                  >
                    Précédent
                  </button>

                  <span className="cd-fav-page-info">
                    Page {meta.current_page} sur {meta.last_page}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    className="cd-fav-page-btn"
                  >
                    Suivant
                  </button>
                </div>
              )}

              <div className="cd-fav-footer-cta">
                <button onClick={() => navigate("/recherche")} className="cd-fav-discover-btn">
                  Découvrir d'autres talents
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}